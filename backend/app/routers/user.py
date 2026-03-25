from fastapi import APIRouter, Depends, HTTPException
from starlette import status

from app.deps import get_current_user
from app.schemas.user import UserProfile, UserProfileUpdate
from app.services.user_service import update_profile


router = APIRouter(prefix="/user", tags=["user"])


@router.get("/profile", response_model=UserProfile)
async def get_profile(user=Depends(get_current_user)):
    return UserProfile(**user.model_dump())


@router.put("/profile", response_model=UserProfile)
async def put_profile(input: UserProfileUpdate, user=Depends(get_current_user)):
    try:
        updated = await update_profile(user.id, input)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return UserProfile(**updated.model_dump())
