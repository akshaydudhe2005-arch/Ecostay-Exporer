import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# --- Slowapi Imports for Rate Limiting ---
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

from app.config import CORS_ORIGINS
from app.database import close_db, connect_db, db, get_db
from app.models.seed import SEED_METRICS, SEED_RESERVATIONS, SEED_STAYS
from app.routes import ai_metrics, auth, booking, stays  # Imported booking here
from app.routes.auth import limiter  # Import the limiter instance from your auth router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def seed_database() -> None:
    database = get_db()
    if await database.stays.count_documents({}) == 0:
        await database.stays.insert_many(SEED_STAYS)
    if await database.reservations.count_documents({}) == 0:
        await database.reservations.insert_many(SEED_RESERVATIONS)
    if await database.metrics.count_documents({"key": "dashboard"}) == 0:
        await database.metrics.insert_one({"key": "dashboard", **SEED_METRICS})


@asynccontextmanager
async def lifespan(app_instance: FastAPI):  # Renamed variable to map limiter state clearly
    connected = await connect_db()
    if connected:
        try:
            await seed_database()
        except Exception as exc:
            logger.warning("Seed skipped: %s", exc)
    yield
    await close_db()


app = FastAPI(title="EcoStay Explorer API", version="1.0.0", lifespan=lifespan)

# --- Attach Rate Limiter State & Global Exception Handler ---
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, exc: RequestValidationError):
    return JSONResponse(status_code=400, content={"detail": exc.errors()})


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
    logger.exception("Unhandled error: %s", exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# App Routing Engine Registry
app.include_router(auth.router)
app.include_router(stays.router)
app.include_router(stays.reservations_router)
app.include_router(ai_metrics.router)
app.include_router(booking.router)  # Included booking router here smoothly


@app.get("/api/health")
async def health_check():
    if db is None:
        return {"status": "fallback", "database": "fallback"}
    try:
        database = get_db()
        await database.command("ping")
        # Changing "ok" to "connected" updates the frontend badge to green
        return {"status": "connected", "database": "connected"}
    except Exception:
        raise HTTPException(status_code=503, detail="Database unavailable")