import logging
import json
import urllib.error
import urllib.request
from fastapi import APIRouter, HTTPException, status

from app.config import GEMINI_API_KEY
from app.database import db, get_db
from app.models.schemas import AIAnalysisRequest, AIAnalysisResponse, AIMetricsResponse
from app.models.seed import SEED_METRICS

logger = logging.getLogger(__name__)

# Removed prefix so endpoints match exact frontend URLs
router = APIRouter(tags=["ai-metrics"])


def _local_analysis(prompt: str) -> AIAnalysisResponse:
    return AIAnalysisResponse(
        analysis=(
            "EcoStay Explorer recommendation: prioritize stays with verified carbon-neutral badges, "
            "choose rail over air when possible, and offset remaining travel emissions through our "
            f"reforestation partners. Regarding your question — {prompt.strip()}"
        ),
        source="local-fallback",
    )


@router.get("/api/ai-metrics", response_model=AIMetricsResponse)
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch metrics",
        )


@router.post("/api/ai/analyze", response_model=AIAnalysisResponse)
@router.post("/api/ai-metrics/analyze", response_model=AIAnalysisResponse)
async def analyze_sustainability(payload: AIAnalysisRequest) -> AIAnalysisResponse:
    clean_key = (
        GEMINI_API_KEY.strip().replace('"', '').replace("'", "")
        if GEMINI_API_KEY
        else ""
    )

    # Check key presence
    if not clean_key or not (clean_key.startswith("AIza") or clean_key.startswith("AQ.")):
        logger.warning("⚠️ Invalid or missing GEMINI_API_KEY format in .env. Returning local fallback.")
        return _local_analysis(payload.prompt)

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={clean_key}"

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
        logger.info("✅ Gemini 3.5 Flash successfully returned a response!")
        return AIAnalysisResponse(analysis=text.strip(), source="gemini")

    except urllib.error.HTTPError as exc:
        error_details = exc.read().decode("utf-8")
        logger.error("❌ Gemini API HTTP Error %s: %s", exc.code, error_details)
        return _local_analysis(payload.prompt)
    except Exception as exc:
        logger.error("❌ Gemini API Execution Failed: %s", exc)
        return _local_analysis(payload.prompt)