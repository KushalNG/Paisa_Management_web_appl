from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.deps import get_current_user
from app.schemas.dashboard import DashboardStats
from app.services.dashboard_service import get_dashboard_stats, get_dashboard_budgets


router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def dashboard_stats(
    month: Optional[str] = Query(default=None),
    startDate: Optional[date] = Query(default=None),
    endDate: Optional[date] = Query(default=None),
    tillDate: Optional[bool] = Query(default=False),
    user=Depends(get_current_user),
):
    return await get_dashboard_stats(
        user_id=user.id,
        user_created_at=user.createdAt,
        month=month,
        start_date=startDate,
        end_date=endDate,
        till_date=bool(tillDate),
    )


@router.get("/budgets")
async def dashboard_budgets(
    month: Optional[str] = Query(default=None),
    startDate: Optional[date] = Query(default=None),
    endDate: Optional[date] = Query(default=None),
    tillDate: Optional[bool] = Query(default=False),
    user=Depends(get_current_user),
):
    return await get_dashboard_budgets(
        user_id=user.id,
        user_created_at=user.createdAt,
        month=month,
        start_date=startDate,
        end_date=endDate,
        till_date=bool(tillDate),
    )
