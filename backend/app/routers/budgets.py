from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from starlette import status

from app.deps import get_current_user
from app.schemas.budget import BudgetCreate, BudgetPublic, BudgetUpdate
from app.services.budget_service import create_budget, delete_budget, list_budgets, update_budget


router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.get("", response_model=List[BudgetPublic])
async def get_budgets(
    month: Optional[str] = Query(default=None),
    user=Depends(get_current_user),
):
    return await list_budgets(user.id, month=month)


@router.post("", response_model=BudgetPublic, status_code=status.HTTP_201_CREATED)
async def post_budget(input: BudgetCreate, user=Depends(get_current_user)):
    try:
        return await create_budget(user.id, input)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Budget already exists for this category/month")


@router.put("/{budget_id}", response_model=BudgetPublic)
async def put_budget(budget_id: str, input: BudgetUpdate, user=Depends(get_current_user)):
    try:
        updated = await update_budget(user.id, budget_id, input)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Budget already exists for this category/month")
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
    return updated


@router.delete("/{budget_id}")
async def remove_budget(budget_id: str, user=Depends(get_current_user)):
    deleted = await delete_budget(user.id, budget_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
    return {"message": "Budget deleted successfully"}
