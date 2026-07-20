import os
from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Request, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.auth_utils import (
    create_access_token,
    get_current_user,
    hash_password,
    serialize_user,
    verify_password,
)
from app.database import get_db
from app.models.schemas import TokenResponse, UserCreate, UserLogin, UserResponse

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/api/auth", tags=["auth"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com")


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(request: Request, payload: UserCreate) -> TokenResponse:
    try:
        database = get_db()
        if database is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database unavailable — configure MONGO_URI",
            )

        existing = await database.users.find_one({"email": payload.email.lower()})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

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
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed due to structural error: {str(e)}",
        )


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
async def login(request: Request, payload: UserLogin) -> TokenResponse:
    try:
        database = get_db()
        if database is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database unavailable — configure MONGO_URI",
            )

        doc = await database.users.find_one({"email": payload.email.lower()})
        if not doc or not verify_password(payload.password, doc["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        user = serialize_user(doc)
        token = create_access_token({"sub": user["id"], "email": user["email"]})
        return TokenResponse(access_token=token, user=UserResponse(**user))
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed",
        )


@router.post("/google", response_model=TokenResponse)
async def google_auth(token_payload: dict) -> TokenResponse:
    """Handles Google OAuth token exchange and provisions an app JWT."""
    try:
        database = get_db()
        token = token_payload.get("credential")
        if not token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing Google credential token",
            )

        id_info = id_token.verify_oauth2_token(
            token, google_requests.Request(), GOOGLE_CLIENT_ID
        )

        email = id_info.get("email").lower()
        name = id_info.get("name", "")

        doc = await database.users.find_one({"email": email})

        if not doc:
            doc = {
                "email": email,
                "password": "",  # OAuth users do not require a local password
                "name": name,
                "createdAt": datetime.now(timezone.utc),
            }
            result = await database.users.insert_one(doc)
            doc["_id"] = result.inserted_id

        user = serialize_user(doc)
        app_token = create_access_token({"sub": user["id"], "email": user["email"]})
        return TokenResponse(access_token=app_token, user=UserResponse(**user))

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token validation match",
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth exchange crashed",
        )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)) -> UserResponse:
    try:
        database = get_db()
        if database is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database unavailable",
            )

        try:
            user_oid = ObjectId(current_user["id"])
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )

        doc = await database.users.find_one({"_id": user_oid})
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        user = serialize_user(doc)
        return UserResponse(**user)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user",
        )