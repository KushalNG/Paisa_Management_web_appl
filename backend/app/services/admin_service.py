from datetime import datetime
from typing import List, Optional

from app.core.security import hash_password
from app.db.mongo import mongo
from app.schemas.admin import AdminUserPublic, AdminUserDetail
from app.schemas.commitment import CommitmentPublic
from app.schemas.transaction import TransactionPublic


async def list_users() -> List[AdminUserPublic]:
    docs = await mongo.db.users.find({}, {"_id": 0}).sort("createdAt", -1).to_list(2000)
    return [
        AdminUserPublic(
            id=d["id"],
            fullName=d["fullName"],
            phone=d["phone"],
            email=d["email"],
            role=d["role"],
            walletBalance=float(d.get("walletBalance", 0)),
            createdAt=_to_iso(d.get("createdAt")),
        )
        for d in docs
    ]


def _to_iso(value) -> str:
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, str):
        return value
    return ""


async def get_user_detail(user_id: str) -> Optional[AdminUserDetail]:
    user = await mongo.db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        return None
    transactions = await mongo.db.transactions.find({"userId": user_id}, {"_id": 0}).to_list(2000)
    commitments = await mongo.db.commitments.find({"userId": user_id}, {"_id": 0}).to_list(2000)

    total_income = sum(t["amount"] for t in transactions if t["type"] == "receive")
    total_expense = sum(t["amount"] for t in transactions if t["type"] == "spend")

    return AdminUserDetail(
        id=user["id"],
        fullName=user["fullName"],
        phone=user["phone"],
        email=user["email"],
        role=user["role"],
        walletBalance=float(user.get("walletBalance", 0)),
        createdAt=_to_iso(user.get("createdAt")),
        transactions=[TransactionPublic(**t) for t in transactions],
        commitments=[CommitmentPublic(**c) for c in commitments],
        stats={
            "totalIncome": total_income,
            "totalExpense": total_expense,
            "transactionCount": len(transactions),
            "commitmentCount": len(commitments),
        },
    )


async def update_user(user_id: str, data: dict) -> bool:
    result = await mongo.db.users.update_one({"id": user_id}, {"$set": data})
    return result.matched_count > 0


async def delete_user(user_id: str) -> bool:
    await mongo.db.transactions.delete_many({"userId": user_id})
    await mongo.db.commitments.delete_many({"userId": user_id})
    await mongo.db.budgets.delete_many({"userId": user_id})
    result = await mongo.db.users.delete_one({"id": user_id})
    return result.deleted_count > 0


async def reset_password(user_id: str, new_password: str) -> bool:
    result = await mongo.db.users.update_one(
        {"id": user_id}, {"$set": {"passwordHash": hash_password(new_password)}}
    )
    return result.matched_count > 0
