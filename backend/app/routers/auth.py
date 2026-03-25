from fastapi import APIRouter, HTTPException
from starlette import status

from app.core.config import settings
from app.core.security import create_access_token
from app.schemas.auth import AuthResponse
from app.schemas.user import UserCreate, UserLogin, UserPublic
from app.services.user_service import (
    create_user,
    get_user_by_phone,
    verify_user_password,
    update_last_login,
)


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(input: UserCreate):
    existing = await get_user_by_phone(input.phone)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Phone number already exists")

    user = await create_user(input)
    token = create_access_token(user.id, user.role, settings.jwt_expires_minutes)
    return AuthResponse(token=token, user=UserPublic(**user.model_dump()))


@router.post("/login", response_model=AuthResponse)
async def login(input: UserLogin):
    user = await get_user_by_phone(input.phone)
    if not user or not verify_user_password(user, input.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid phone number or password")

    first_login = user.lastLoginAt is None
    await update_last_login(user.id)
    token = create_access_token(user.id, user.role, settings.jwt_expires_minutes)
    return AuthResponse(token=token, user=UserPublic(**user.model_dump()), firstLogin=first_login)
