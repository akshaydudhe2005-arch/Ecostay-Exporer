import logging
import json
import ssl
import socket
import asyncio
import urllib.error
import urllib.request
from fastapi import APIRouter, HTTPException, status

from app.config import GEMINI_API_KEY
from app.database import db, get_db
from app.models.schemas import AIAnalysisRequest, AIAnalysisResponse, AIMetricsResponse
from app.models.seed import SEED_METRICS

logger = logging.getLogger(__name__)

router = APIRouter(tags=["ai-metrics"])

# Bypasses Windows urllib SSL certificate verification issues
ssl_context = ssl._create_unverified_context()

# Primary target is Gemini 3.5 Flash, with 3.1 Flash-Lite as automatic failover during high demand
PRIMARY_MODEL = "gemini-3.5-flash"
BACKUP_MODEL = "gemini-3.1-flash-lite"


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

    if not clean_key or clean_key == "your_gemini_api_key_here":
        logger.warning("⚠️ GEMINI_API_KEY is missing or unconfigured in .env. Using fallback.")
        return _local_analysis(payload.prompt)

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

    # Retry sequence: gemini-3.5-flash with progressive backoff delays, then backup model
    models_to_try = [
        (PRIMARY_MODEL, 3),      # 3 attempts for gemini-3.5-flash
        (BACKUP_MODEL, 2),       # 2 attempts for gemini-3.1-flash-lite backup
    ]

    for model_name, max_attempts in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={clean_key}"

        req = urllib.request.Request(
            url,
            data=body,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            },
            method="POST",
        )

        for attempt in range(1, max_attempts + 1):
            try:
                with urllib.request.urlopen(req, context=ssl_context, timeout=35) as response:
                    data = json.loads(response.read().decode("utf-8"))

                text = data["candidates"][0]["content"]["parts"][0]["text"]
                logger.info("✅ Live response generated successfully using %s!", model_name)
                return AIAnalysisResponse(analysis=text.strip(), source="gemini")

            except urllib.error.HTTPError as exc:
                error_details = exc.read().decode("utf-8")

                # Handle 503 (High Demand) or 429 (Rate Limit) with progressive backoff delay
                if exc.code in (503, 429) and attempt < max_attempts:
                    wait_time = attempt * 2  # 2s, 4s delay
                    logger.warning(
                        "⚠️ %s returned HTTP %s (high demand). Retrying in %ds (attempt %d/%d)...",
                        model_name, exc.code, wait_time, attempt, max_attempts
                    )
                    await asyncio.sleep(wait_time)
                    continue

                logger.warning("❌ %s failed with HTTP %s: %s", model_name, exc.code, error_details)
                break  # Move to backup model on persistent error

            except (TimeoutError, socket.timeout):
                logger.warning("⏱️ Timeout on %s (attempt %d/%d). Retrying...", model_name, attempt, max_attempts)
                continue
            except Exception as exc:
                logger.error("❌ Execution Error on %s: %s", model_name, exc)
                break

    logger.error("❌ All model requests failed or hit sustained demand spikes. Returning local fallback.")
    return _local_analysis(payload.prompt)