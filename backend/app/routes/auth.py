from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.auth_utils import (
    create_access_token,
    get_current_user,
    hash_password,
    serialize_user,
    verify_password,
)
from app.database import db, get_db
from app.models.schemas import TokenResponse, UserCreate, UserLogin, UserResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate) -> TokenResponse:
    try:
        if db is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database unavailable — configure MONGO_URI",
            )
        database = get_db()
        existing = await database.users.find_one({"email": payload.email.lower()})
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

        doc = {
            "email": payload.email.lower(),
            "password": hash_password(payload.password),
            "name": payload.name,
            "createdAt": datetime.now(timezone.utc),
        }
        result = await database.users.insert_one(doc)
        user = serialize_user({**doc, "_id": result.inserted_id})
        token = create_access_token({"sub": user["id"], "email": user["email"]})
        return TokenResponse(access_token=token, user=UserResponse(**user))
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Registration failed")


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin) -> TokenResponse:
    try:
        if db is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database unavailable — configure MONGO_URI",
            )
        database = get_db()
        doc = await database.users.find_one({"email": payload.email.lower()})
        if not doc or not verify_password(payload.password, doc["password"]):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

        user = serialize_user(doc)
        token = create_access_token({"sub": user["id"], "email": user["email"]})
        return TokenResponse(access_token=token, user=UserResponse(**user))
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Login failed")


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)) -> UserResponse:
    try:
        if db is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database unavailable",
            )
        database = get_db()
        try:
            user_oid = ObjectId(current_user["id"])
        except Exception:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        doc = await database.users.find_one({"_id": user_oid})
        if not doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        user = serialize_user(doc)
        return UserResponse(**user)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch user")
