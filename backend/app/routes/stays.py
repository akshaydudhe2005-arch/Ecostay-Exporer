from fastapi import APIRouter, HTTPException, status

from app.database import db, get_db
from app.models.schemas import EcoStay, Reservation
from app.models.seed import SEED_RESERVATIONS, SEED_STAYS

router = APIRouter(prefix="/api/stays", tags=["stays"])


@router.get("", response_model=list[EcoStay])
async def list_stays() -> list[EcoStay]:
    try:
        if db is None:
            return [EcoStay(**stay) for stay in SEED_STAYS]
        database = get_db()
        docs = await database.stays.find().sort("id", 1).to_list(length=100)
        if not docs:
            return [EcoStay(**stay) for stay in SEED_STAYS]
        return [EcoStay(**{k: v for k, v in doc.items() if k != "_id"}) for doc in docs]
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch stays")


@router.get("/{stay_id}", response_model=EcoStay)
async def get_stay(stay_id: int) -> EcoStay:
    try:
        if db is None:
            fallback = next((s for s in SEED_STAYS if s["id"] == stay_id), None)
            if not fallback:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stay not found")
            return EcoStay(**fallback)
        database = get_db()
        doc = await database.stays.find_one({"id": stay_id})
        if not doc:
            fallback = next((s for s in SEED_STAYS if s["id"] == stay_id), None)
            if not fallback:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stay not found")
            return EcoStay(**fallback)
        return EcoStay(**{k: v for k, v in doc.items() if k != "_id"})
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch stay")


reservations_router = APIRouter(prefix="/api/reservations", tags=["reservations"])


@reservations_router.get("", response_model=list[Reservation])
async def list_reservations() -> list[Reservation]:
    try:
        if db is None:
            return [Reservation(**r) for r in SEED_RESERVATIONS]
        database = get_db()
        docs = await database.reservations.find().to_list(length=100)
        if not docs:
            return [Reservation(**r) for r in SEED_RESERVATIONS]
        return [Reservation(**{k: v for k, v in doc.items() if k != "_id"}) for doc in docs]
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch reservations")
