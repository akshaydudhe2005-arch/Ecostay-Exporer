import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import MONGO_DB_NAME, MONGO_URI

logger = logging.getLogger(__name__)

client: AsyncIOMotorClient | None = None
db: AsyncIOMotorDatabase | None = None


async def connect_db() -> bool:
    global client, db
    try:
        client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        await client.admin.command("ping")
        db = client[MONGO_DB_NAME]
        logger.info("MongoDB connected: %s", MONGO_DB_NAME)
        return True
    except Exception as exc:
        logger.warning("MongoDB connection failed: %s — using seed fallbacks", exc)
        client = None
        db = None
        return False


async def close_db() -> None:
    global client, db
    if client is not None:
        client.close()
    client = None
    db = None


def get_db() -> AsyncIOMotorDatabase:
    if db is None:
        raise RuntimeError("Database not initialized")
    return db
