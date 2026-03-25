from fastapi import APIRouter, Depends, HTTPException
from starlette import status

from app.deps import require_admin
from app.schemas.admin import AdminResetPassword, AdminUserDetail, AdminUserPublic, AdminUserUpdate
from app.services.admin_service import delete_user, get_user_detail, list_users, reset_password, update_user


router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[AdminUserPublic])
async def admin_list_users(_=Depends(require_admin)):
    return await list_users()


@router.get("/users/{user_id}", response_model=AdminUserDetail)
async def admin_user_detail(user_id: str, _=Depends(require_admin)):
    user = await get_user_detail(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.put("/users/{user_id}")
async def admin_update_user(user_id: str, input: AdminUserUpdate, _=Depends(require_admin)):
    updated = await update_user(user_id, input.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"message": "User updated successfully"}


@router.delete("/users/{user_id}")
async def admin_delete_user(user_id: str, _=Depends(require_admin)):
    deleted = await delete_user(user_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"message": "User deleted successfully"}


@router.put("/users/{user_id}/reset-password")
async def admin_reset_password(user_id: str, input: AdminResetPassword, _=Depends(require_admin)):
    if len(input.newPassword) < 6:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 6 characters")
    updated = await reset_password(user_id, input.newPassword)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"message": "Password reset successfully"}
