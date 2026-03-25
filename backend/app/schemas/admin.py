from typing import List, Optional
from pydantic import EmailStr

from app.schemas.common import APIModel
from app.schemas.transaction import TransactionPublic
from app.schemas.commitment import CommitmentPublic


class AdminUserPublic(APIModel):
    id: str
    fullName: str
    phone: str
    email: EmailStr
    role: str
    walletBalance: float
    createdAt: str


class AdminUserUpdate(APIModel):
    fullName: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None


class AdminResetPassword(APIModel):
    newPassword: str


class AdminUserDetail(APIModel):
    id: str
    fullName: str
    phone: str
    email: EmailStr
    role: str
    walletBalance: float
    createdAt: str
    transactions: List[TransactionPublic]
    commitments: List[CommitmentPublic]
    stats: dict
