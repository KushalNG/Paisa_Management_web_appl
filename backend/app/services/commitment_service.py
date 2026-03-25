from datetime import datetime, timezone
import uuid
from typing import Optional, List

from app.db.mongo import mongo
from app.schemas.commitment import CommitmentCreate, CommitmentPublic, CommitmentUpdate


async def list_commitments(user_id: str) -> List[CommitmentPublic]:
    cursor = mongo.db.commitments.find({"userId": user_id}, {"_id": 0}).sort("createdAt", -1)
    return [CommitmentPublic(**doc) for doc in await cursor.to_list(1000)]


async def get_commitment(user_id: str, commitment_id: str) -> Optional[CommitmentPublic]:
    doc = await mongo.db.commitments.find_one({"id": commitment_id, "userId": user_id}, {"_id": 0})
    return CommitmentPublic(**doc) if doc else None


async def create_commitment(user_id: str, input: CommitmentCreate) -> CommitmentPublic:
    existing = await mongo.db.commitments.find_one(
        {"userId": user_id, "name": input.name}, {"_id": 0}
    )
    if existing:
        raise ValueError("duplicate")

    now = datetime.now(timezone.utc)
    commitment = CommitmentPublic(
        id=str(uuid.uuid4()),
        name=input.name,
        type=input.type,
        amount=float(input.amount),
        deductionDate=input.deductionDate,
        endDate=input.endDate,
        reminderEnabled=input.reminderEnabled,
        createdAt=now,
        updatedAt=None,
    )
    doc = commitment.model_dump()
    if commitment.endDate:
        doc["endDate"] = commitment.endDate.isoformat()
    doc["createdAt"] = commitment.createdAt.isoformat()
    if commitment.updatedAt:
        doc["updatedAt"] = commitment.updatedAt.isoformat()
    await mongo.db.commitments.insert_one({**doc, "userId": user_id})
    return commitment


async def update_commitment(user_id: str, commitment_id: str, input: CommitmentUpdate) -> Optional[CommitmentPublic]:
    current = await get_commitment(user_id, commitment_id)
    if not current:
        return None

    if input.name and input.name != current.name:
        existing = await mongo.db.commitments.find_one(
            {"userId": user_id, "name": input.name}, {"_id": 0}
        )
        if existing:
            raise ValueError("duplicate")

    data = current.model_dump()
    for key, value in input.model_dump(exclude_unset=True).items():
        if value is not None:
            data[key] = value
    data["updatedAt"] = datetime.now(timezone.utc)

    if isinstance(data.get("endDate"), str):
        pass
    elif data.get("endDate") is not None:
        data["endDate"] = data["endDate"].isoformat()
    data["updatedAt"] = data["updatedAt"].isoformat()

    await mongo.db.commitments.update_one({"id": commitment_id, "userId": user_id}, {"$set": data})
    return CommitmentPublic(**data)


async def delete_commitment(user_id: str, commitment_id: str) -> bool:
    result = await mongo.db.commitments.delete_one({"id": commitment_id, "userId": user_id})
    return result.deleted_count > 0
