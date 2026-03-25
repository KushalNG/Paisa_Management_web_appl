from datetime import date, datetime
from typing import Optional, Literal
from pydantic import Field

from app.schemas.common import APIModel


CommitmentType = Literal["EMI", "Subscription", "Rent", "Other"]


class CommitmentBase(APIModel):
    name: str
    type: CommitmentType
    amount: float = Field(gt=0)
    deductionDate: int = Field(ge=1, le=31)
    endDate: Optional[date] = None
    reminderEnabled: bool = True


class CommitmentCreate(CommitmentBase):
    pass


class CommitmentUpdate(APIModel):
    name: Optional[str] = None
    type: Optional[CommitmentType] = None
    amount: Optional[float] = None
    deductionDate: Optional[int] = None
    endDate: Optional[date] = None
    reminderEnabled: Optional[bool] = None


class CommitmentPublic(CommitmentBase):
    id: str
    createdAt: datetime
    updatedAt: Optional[datetime] = None
    lastDeductedMonth: Optional[str] = None
    lastDeductedAt: Optional[date] = None
