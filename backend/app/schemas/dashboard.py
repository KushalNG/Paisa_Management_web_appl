from typing import List, Optional
from pydantic import Field

from app.schemas.common import APIModel


class CategoryExpense(APIModel):
    category: str
    amount: float = Field(ge=0)


class TrendPoint(APIModel):
    month: str
    values: dict[str, float]


class BudgetInfo(APIModel):
    category: str
    budget: float
    spent: float


class UpcomingCommitment(APIModel):
    name: str
    amount: float
    dueDate: str


class ExceededBudget(APIModel):
    category: str
    budget: float
    spent: float
    excess: float


class DashboardStats(APIModel):
    walletBalance: float
    totalIncome: float
    totalExpense: float
    categoryExpenses: List[CategoryExpense]
    trends: List[dict]
    budgets: List[BudgetInfo]
    upcomingCommitments: List[UpcomingCommitment]
    exceededBudgets: List[ExceededBudget]
