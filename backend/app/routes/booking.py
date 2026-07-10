from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, status
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, EmailStr, field_validator
from bson import ObjectId
from bson.errors import InvalidId
from app.database import get_db

router = APIRouter(prefix="/api/bookings", tags=["bookings"])

# Request validation schema for creation
class BookingCreate(BaseModel):
    stay_id: str
    stay_name: str
    check_in: str
    check_out: str
    guests: int
    user_email: EmailStr

    @field_validator("user_email", mode="before")
    @classmethod
    def normalize_email(cls, v: Any) -> Any:
        if isinstance(v, str):
            return v.strip().lower()
        return v

# Request validation schema for date updates
class BookingUpdate(BaseModel):
    check_in: str
    check_out: Optional[str] = None
    model_config = {"extra": "ignore"}


@router.post("", status_code=status.HTTP_201_CREATED)
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_booking(payload: BookingCreate) -> Dict[str, str]:
    database = get_db()
    if database is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database offline"
        )
    
    booking_doc = {
        "stay_id": payload.stay_id,
        "stay_name": payload.stay_name,
        "check_in": payload.check_in,
        "check_out": payload.check_out,
        "guests": payload.guests,
        "user_email": payload.user_email,
        "booked_at": datetime.now(timezone.utc)
    }
    
    try:
        result = await database.reservations.insert_one(booking_doc)
        return {
            "status": "success", 
            "booking_id": str(result.inserted_id),
            "message": "Reservation secured successfully!"
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save booking to database"
        )


@router.get("/user/{email}")
@router.get("/user/{email}/")
async def get_user_bookings(email: str) -> List[Dict[str, Any]]:
    database = get_db()
    if database is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection missing"
        )
    
    try:
        cursor = database.reservations.find({"user_email": email.strip().lower()})
        user_bookings = await cursor.to_list(length=100)
        
        for booking in user_bookings:
            booking["id"] = str(booking["_id"])
            del booking["_id"]
            
        return jsonable_encoder(user_bookings)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user dashboard data: {str(e)}"
        )


# --- GET SINGLE RESERVATION BY ID (HANDLES BOTH SLASH FORMATS) ---
@router.get("/{booking_id}")
@router.get("/{booking_id}/")
async def get_single_booking(booking_id: str) -> Dict[str, Any]:
    database = get_db()
    if database is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database offline"
        )
    
    # Clean any accidental spaces or trailing slashes leaking from URL parameters
    clean_id = booking_id.strip().strip("/")
        
    match_query = {"$or": [{"_id": clean_id}]}
    try:
        match_query["$or"].append({"_id": ObjectId(clean_id)})
    except InvalidId:
        pass

    try:
        booking = await database.reservations.find_one(match_query)
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target reservation not found in the cluster database"
            )
            
        booking["id"] = str(booking["_id"])
        del booking["_id"]
        return jsonable_encoder(booking)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to query database record: {str(e)}"
        )


# --- UPDATE/MODIFY OPERATION (HANDLES BOTH SLASH FORMATS) ---
@router.put("/{booking_id}")
@router.put("/{booking_id}/")
async def update_booking(booking_id: str, payload: BookingUpdate) -> Dict[str, str]:
    database = get_db()
    if database is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database offline"
        )
    
    clean_id = booking_id.strip().strip("/")
        
    match_query = {"$or": [{"_id": clean_id}]}
    try:
        match_query["$or"].append({"_id": ObjectId(clean_id)})
    except InvalidId:
        pass

    update_payload = {"check_in": payload.check_in}
    if payload.check_out:
        update_payload["check_out"] = payload.check_out

    try:
        result = await database.reservations.update_one(
            match_query,
            {"$set": update_payload}
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No corresponding reservation found in the cluster"
            )
            
        return {
            "status": "success",
            "message": "Transaction documents updated securely"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to modify database document cluster: {str(e)}"
        )


# --- DELETE/CANCEL OPERATION (HANDLES BOTH SLASH FORMATS) ---
@router.delete("/{booking_id}")
@router.delete("/{booking_id}/")
async def delete_booking(booking_id: str) -> Dict[str, str]:
    database = get_db()
    if database is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database offline"
        )
    
    clean_id = booking_id.strip().strip("/")
        
    match_query = {"$or": [{"_id": clean_id}]}
    try:
        match_query["$or"].append({"_id": ObjectId(clean_id)})
    except InvalidId:
        pass

    try:
        result = await database.reservations.delete_one(match_query)
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target document record missing or already dropped"
            )
            
        return {
            "status": "success",
            "message": "Reservation cleanly purged from the cluster database"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database record drop failed completely: {str(e)}"
        )