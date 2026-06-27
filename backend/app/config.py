import os
from pathlib import Path

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[2]
load_dotenv(ROOT_DIR / ".env")
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "ecostay_explorer")
JWT_SECRET = os.getenv("JWT_SECRET", "ecostay-dev-secret-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 60 * 24
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
CORS_ORIGINS = ["http://localhost:3000"]
