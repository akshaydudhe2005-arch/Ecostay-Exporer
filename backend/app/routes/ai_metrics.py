import logging

from fastapi import APIRouter, HTTPException, status

from app.config import GEMINI_API_KEY
from app.database import db, get_db
from app.models.schemas import AIAnalysisRequest, AIAnalysisResponse, AIMetricsResponse
from app.models.seed import SEED_METRICS

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/ai-metrics", tags=["ai-metrics"])


def _local_analysis(prompt: str) -> AIAnalysisResponse:
    return AIAnalysisResponse(
        analysis=(
            "EcoStay Explorer recommendation: prioritize stays with verified carbon-neutral badges, "
            "choose rail over air when possible, and offset remaining travel emissions through our "
            f"reforestation partners. Regarding your question — {prompt.strip()}"
        ),
        source="local-fallback",
    )


@router.get("", response_model=AIMetricsResponse)
async def get_metrics() -> AIMetricsResponse:
    try:
        if db is None:
            return AIMetricsResponse(**SEED_METRICS)
        database = get_db()
        doc = await database.metrics.find_one({"key": "dashboard"})
        if not doc:
            return AIMetricsResponse(**SEED_METRICS)
        payload = {k: v for k, v in doc.items() if k not in ("_id", "key")}
        return AIMetricsResponse(**payload)
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch metrics")


@router.post("/analyze", response_model=AIAnalysisResponse)
async def analyze_sustainability(payload: AIAnalysisRequest) -> AIAnalysisResponse:
    import json
    import urllib.error
    import urllib.request

    if not GEMINI_API_KEY or not GEMINI_API_KEY.startswith("AIza"):
        return _local_analysis(payload.prompt)

    try:
        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
        )
        body = json.dumps(
            {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": (
                                    "You are an eco-hospitality sustainability analyst for EcoStay Explorer. "
                                    "Provide a concise, actionable sustainability insight in 2-3 sentences.\n\n"
                                    f"User query: {payload.prompt}"
                                )
                            }
                        ]
                    }
                ]
            }
        ).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=20) as response:
            data = json.loads(response.read().decode("utf-8"))
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        return AIAnalysisResponse(analysis=text.strip(), source="gemini")
    except urllib.error.HTTPError as exc:
        logger.warning("Gemini API HTTP error %s — using local fallback", exc.code)
        return _local_analysis(payload.prompt)
    except Exception as exc:
        logger.warning("Gemini API failed: %s — using local fallback", exc)
        return _local_analysis(payload.prompt)
