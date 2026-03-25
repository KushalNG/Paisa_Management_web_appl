from datetime import datetime, timezone
import uuid
from typing import List

from fastapi import APIRouter
from pydantic import BaseModel, ConfigDict, Field

from app.db.mongo import mongo
from app.routers import auth, user, transactions, commitments, dashboard, budgets, admin


api_router = APIRouter(prefix="/api")


class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


@api_router.get("/")
async def root():
    return {"message": "Hello World"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc["timestamp"] = doc["timestamp"].isoformat()
    _ = await mongo.db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await mongo.db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check.get("timestamp"), str):
            check["timestamp"] = datetime.fromisoformat(check["timestamp"])
    return status_checks


# Sub-routers
api_router.include_router(auth.router)
api_router.include_router(user.router)
api_router.include_router(transactions.router)
api_router.include_router(commitments.router)
api_router.include_router(dashboard.router)
api_router.include_router(budgets.router)
api_router.include_router(admin.router)
