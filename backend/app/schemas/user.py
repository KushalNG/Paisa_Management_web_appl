from datetime import datetime
from typing import Optional
from pydantic import EmailStr, Field

from app.schemas.common import APIModel


class UserBase(APIModel):
    fullName: str
    phone: str = Field(min_length=3)
    email: EmailStr
    role: str
    walletBalance: float


class UserCreate(APIModel):
    fullName: str
    phone: str = Field(min_length=3)
    email: EmailStr
    password: str = Field(min_length=6)
    startingBalance: float = 0


class UserLogin(APIModel):
    phone: str
    password: str


class UserPublic(UserBase):
    id: str


class UserProfile(APIModel):
    fullName: str
    phone: str
    email: EmailStr
    designation: Optional[str] = None
    salary: Optional[float] = None
    salaryDate: Optional[int] = None
    startingBalance: float = 0
    walletBalance: float


class UserProfileUpdate(APIModel):
    fullName: Optional[str] = None
    email: Optional[EmailStr] = None
    designation: Optional[str] = None
    salary: Optional[float] = None
    salaryDate: Optional[int] = Field(default=None, ge=1, le=31)
    startingBalance: Optional[float] = None


class UserDB(UserBase):
    id: str
    passwordHash: str
    designation: Optional[str] = None
    salary: Optional[float] = None
    salaryDate: Optional[int] = None
    startingBalance: float = 0
    createdAt: datetime
    updatedAt: datetime
    lastLoginAt: Optional[datetime] = None
    lastSalaryCreditedMonth: Optional[str] = None
