from datetime import date, datetime
from typing import Optional, Literal
from pydantic import Field

from app.schemas.common import APIModel


TransactionType = Literal["spend", "receive"]


class TransactionBase(APIModel):
    type: TransactionType
    category: Optional[str] = None
    reason: Optional[str] = None
    amount: float = Field(gt=0)
    date: date
    description: Optional[str] = None


class TransactionCreate(TransactionBase):
    pass


class TransactionPublic(TransactionBase):
    id: str
    createdAt: datetime
