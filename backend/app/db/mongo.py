from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings


class MongoClient:
    def __init__(self) -> None:
        self._client: AsyncIOMotorClient | None = None

    def connect(self) -> None:
        if self._client is None:
            self._client = AsyncIOMotorClient(settings.mongo_url)

    def close(self) -> None:
        if self._client is not None:
            self._client.close()
            self._client = None

    @property
    def client(self) -> AsyncIOMotorClient:
        if self._client is None:
            raise RuntimeError("Mongo client is not initialized")
        return self._client

    @property
    def db(self):
        return self.client[settings.db_name]


mongo = MongoClient()


async def init_indexes():
    await mongo.db.users.create_index("phone", unique=True)
    await mongo.db.commitments.create_index(
        [("userId", 1), ("name", 1)], unique=True
    )
    await mongo.db.budgets.create_index(
        [("userId", 1), ("category", 1), ("month", 1)], unique=True
    )
    await mongo.db.transactions.create_index([("userId", 1), ("date", 1)])
