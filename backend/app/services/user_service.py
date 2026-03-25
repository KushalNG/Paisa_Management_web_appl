from datetime import datetime, timezone
import uuid
from typing import Optional

from app.core.security import hash_password, verify_password
from app.db.mongo import mongo
from app.schemas.user import UserCreate, UserDB, UserProfileUpdate


async def get_user_by_phone(phone: str) -> Optional[UserDB]:
    doc = await mongo.db.users.find_one({"phone": phone}, {"_id": 0})
    return UserDB(**doc) if doc else None


async def get_user_by_id(user_id: str) -> Optional[UserDB]:
    doc = await mongo.db.users.find_one({"id": user_id}, {"_id": 0})
    return UserDB(**doc) if doc else None


async def create_user(input: UserCreate) -> UserDB:
    now = datetime.now(timezone.utc)
    user = UserDB(
        id=str(uuid.uuid4()),
        fullName=input.fullName,
        phone=input.phone,
        email=input.email,
        role="user",
        walletBalance=float(input.startingBalance or 0),
        startingBalance=float(input.startingBalance or 0),
        passwordHash=hash_password(input.password),
        designation=None,
        salary=None,
        salaryDate=None,
        createdAt=now,
        updatedAt=now,
        lastLoginAt=None,
    )
    await mongo.db.users.insert_one(user.model_dump())
    return user


def verify_user_password(user: UserDB, password: str) -> bool:
    return verify_password(password, user.passwordHash)


async def update_profile(user_id: str, update: UserProfileUpdate) -> UserDB:
    existing = await get_user_by_id(user_id)
    if not existing:
        raise ValueError("User not found")

    data = existing.model_dump()
    for key, value in update.model_dump(exclude_unset=True).items():
        if value is not None:
            data[key] = value
    data["updatedAt"] = datetime.now(timezone.utc)

    await mongo.db.users.update_one({"id": user_id}, {"$set": data})
    return UserDB(**data)


async def update_last_login(user_id: str) -> None:
    await mongo.db.users.update_one(
        {"id": user_id},
        {"$set": {"lastLoginAt": datetime.now(timezone.utc)}},
    )


async def seed_admin_user(phone: str, password: str, email: str, full_name: str) -> Optional[UserDB]:
    if not phone or not password:
        return None
    existing = await get_user_by_phone(phone)
    if existing:
        return existing

    now = datetime.now(timezone.utc)
    user = UserDB(
        id=str(uuid.uuid4()),
        fullName=full_name,
        phone=phone,
        email=email,
        role="admin",
        walletBalance=0,
        startingBalance=0,
        passwordHash=hash_password(password),
        designation=None,
        salary=None,
        salaryDate=None,
        createdAt=now,
        updatedAt=now,
    )
    await mongo.db.users.insert_one(user.model_dump())
    return user
