from datetime import datetime, timezone, date
import uuid
from typing import Optional

from app.db.mongo import mongo
from app.schemas.transaction import TransactionCreate, TransactionPublic


async def list_transactions(
    user_id: str,
    category: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
):
    query: dict = {"userId": user_id}
    if category:
        query["$or"] = [{"category": category}, {"reason": category}]
    if start_date or end_date:
        date_query: dict = {}
        if start_date:
            date_query["$gte"] = start_date.isoformat()
        if end_date:
            date_query["$lte"] = end_date.isoformat()
        query["date"] = date_query
    if min_amount is not None or max_amount is not None:
        amount_query: dict = {}
        if min_amount is not None:
            amount_query["$gte"] = min_amount
        if max_amount is not None:
            amount_query["$lte"] = max_amount
        query["amount"] = amount_query

    cursor = mongo.db.transactions.find(query, {"_id": 0}).sort("date", -1)
    return [TransactionPublic(**doc) for doc in await cursor.to_list(1000)]


async def create_transaction(user_id: str, input: TransactionCreate) -> TransactionPublic:
    now = datetime.now(timezone.utc)
    transaction = TransactionPublic(
        id=str(uuid.uuid4()),
        type=input.type,
        category=input.category,
        reason=input.reason,
        amount=float(input.amount),
        date=input.date,
        description=input.description,
        createdAt=now,
    )
    doc = transaction.model_dump()
    doc["date"] = transaction.date.isoformat()
    doc["createdAt"] = transaction.createdAt.isoformat()
    await mongo.db.transactions.insert_one({**doc, "userId": user_id})

    delta = -transaction.amount if transaction.type == "spend" else transaction.amount
    await mongo.db.users.update_one({"id": user_id}, {"$inc": {"walletBalance": delta}})
    return transaction


async def delete_transaction(user_id: str, transaction_id: str) -> bool:
    doc = await mongo.db.transactions.find_one({"id": transaction_id, "userId": user_id}, {"_id": 0})
    if not doc:
        return False

    await mongo.db.transactions.delete_one({"id": transaction_id, "userId": user_id})
    amount = float(doc["amount"])
    delta = amount if doc["type"] == "spend" else -amount
    await mongo.db.users.update_one({"id": user_id}, {"$inc": {"walletBalance": delta}})
    return True
