from typing import Optional
from pydantic import Field

from app.schemas.common import APIModel


class BudgetCreate(APIModel):
    category: str
    budgetAmount: float = Field(gt=0)
    month: str = Field(pattern=r"^\d{4}-\d{2}$")  # YYYY-MM


class BudgetUpdate(APIModel):
    category: Optional[str] = None
    budgetAmount: Optional[float] = None
    month: Optional[str] = Field(default=None, pattern=r"^\d{4}-\d{2}$")


class BudgetPublic(APIModel):
    id: str
    category: str
    budgetAmount: float
    month: str
