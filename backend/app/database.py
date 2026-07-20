import logging
import certifi
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import MONGO_DB_NAME, MONGO_URI

logger = logging.getLogger(__name__)

client: AsyncIOMotorClient | None = None
db: AsyncIOMotorDatabase | None = None


async def connect_db() -> bool:
    global client, db

    logger.info("Connecting to MongoDB...")

    # 1. Standard SSL Connection via certifi
    try:
        client = AsyncIOMotorClient(
            MONGO_URI,
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=5000,
        )
        await client.admin.command("ping")
        db = client[MONGO_DB_NAME]
        logger.info("✅ Connected to MongoDB: '%s'", MONGO_DB_NAME)
        return True
    except Exception as exc:
        logger.warning("⚠️ Standard SSL failed: %s. Trying fallback mode...", exc)

    # 2. Permissive TLS Fallback (Valid Motor / PyMongo syntax)
    try:
        client = AsyncIOMotorClient(
            MONGO_URI,
            tls=True,
            tlsAllowInvalidCertificates=True,
            serverSelectionTimeoutMS=5000,
        )
        await client.admin.command("ping")
        db = client[MONGO_DB_NAME]
        logger.info("✅ Connected using TLS fallback mode: '%s'", MONGO_DB_NAME)
        return True
    except Exception as fallback_exc:
        logger.error("❌ MongoDB Atlas connection failed: %s", fallback_exc)
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