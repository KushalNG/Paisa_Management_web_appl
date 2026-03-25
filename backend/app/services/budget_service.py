from datetime import date, datetime
import uuid
from typing import Optional, List

from app.db.mongo import mongo
from app.schemas.budget import BudgetCreate, BudgetPublic, BudgetUpdate


async def list_budgets(user_id: str, month: Optional[str] = None) -> List[BudgetPublic]:
    query = {"userId": user_id}
    if month:
        query["month"] = month
    docs = await mongo.db.budgets.find(query, {"_id": 0}).sort("category", 1).to_list(1000)
    return [BudgetPublic(**doc) for doc in docs]


async def create_budget(user_id: str, input: BudgetCreate) -> BudgetPublic:
    existing = await mongo.db.budgets.find_one(
        {"userId": user_id, "category": input.category, "month": input.month}, {"_id": 0}
    )
    if existing:
        raise ValueError("duplicate")

    budget = BudgetPublic(
        id=str(uuid.uuid4()),
        category=input.category,
        budgetAmount=float(input.budgetAmount),
        month=input.month,
    )
    await mongo.db.budgets.insert_one({**budget.model_dump(), "userId": user_id})
    return budget


async def update_budget(user_id: str, budget_id: str, input: BudgetUpdate) -> Optional[BudgetPublic]:
    current = await mongo.db.budgets.find_one({"id": budget_id, "userId": user_id}, {"_id": 0})
    if not current:
        return None

    data = dict(current)
    for key, value in input.model_dump(exclude_unset=True).items():
        if value is not None:
            data[key] = value

    if (
        data.get("category") != current.get("category")
        or data.get("month") != current.get("month")
    ):
        existing = await mongo.db.budgets.find_one(
            {"userId": user_id, "category": data["category"], "month": data["month"]}, {"_id": 0}
        )
        if existing and existing.get("id") != budget_id:
            raise ValueError("duplicate")

    await mongo.db.budgets.update_one({"id": budget_id, "userId": user_id}, {"$set": data})
    return BudgetPublic(**data)


async def delete_budget(user_id: str, budget_id: str) -> bool:
    result = await mongo.db.budgets.delete_one({"id": budget_id, "userId": user_id})
    return result.deleted_count > 0
