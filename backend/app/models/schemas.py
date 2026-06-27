from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(default="", max_length=120)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    name: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class EcoStay(BaseModel):
    id: int
    title: str
    description: str
    image: str
    location: str
    rating: float
    badge: str


class Reservation(BaseModel):
    id: str
    guest: str
    stay: str
    checkIn: str
    status: Literal["Confirmed", "Pending", "Checked In"]


class ImpactMetric(BaseModel):
    label: str
    value: str
    detail: str
    color: str


class AIMetricsResponse(BaseModel):
    carbonSaved: str
    ecoStaysHosted: str
    rewardBadges: str
    carbonSavedDetail: str
    ecoStaysDetail: str
    rewardBadgesDetail: str
    quarterlyReport: str
    metrics: list[ImpactMetric]


class AIAnalysisRequest(BaseModel):
    prompt: str = Field(min_length=3, max_length=2000)


class AIAnalysisResponse(BaseModel):
    analysis: str
    source: str
