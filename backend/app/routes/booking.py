from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, EmailStr
from app.database import get_db

router = APIRouter(prefix="/api/bookings", tags=["bookings"])

# Request validation schema
class BookingCreate(BaseModel):
    stay_id: str
    stay_name: str
    check_in: str
    check_out: str
    guests: int
    user_email: EmailStr

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_booking(payload: BookingCreate):
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
        "user_email": payload.user_email.lower(),
        "booked_at": datetime.now(timezone.utc)
    }
    
    try:
        result = await database.bookings.insert_one(booking_doc)
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
async def get_user_bookings(email: str):
    database = get_db()
    if database is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection missing"
        )
    
    try:
        # Fetch all records matching the user's lowercase email address
        cursor = database.bookings.find({"user_email": email.lower()})
        user_bookings = await cursor.to_list(length=100)
        
        # Serialize the database ObjectId objects into plain text string IDs
        for booking in user_bookings:
            booking["id"] = str(booking["_id"])
            del booking["_id"]
            
        # jsonable_encoder ensures dates and custom types format cleanly into valid JSON
        return jsonable_encoder(user_bookings)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user dashboard data: {str(e)}"
        )