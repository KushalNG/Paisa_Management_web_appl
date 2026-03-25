from typing import List

from fastapi import APIRouter, Depends, HTTPException
from starlette import status

from app.deps import get_current_user
from app.schemas.commitment import CommitmentCreate, CommitmentPublic, CommitmentUpdate
from app.services.commitment_service import (
    create_commitment,
    delete_commitment,
    list_commitments,
    update_commitment,
)


router = APIRouter(prefix="/commitments", tags=["commitments"])


@router.get("", response_model=List[CommitmentPublic])
async def get_commitments(user=Depends(get_current_user)):
    return await list_commitments(user.id)


@router.post("", response_model=CommitmentPublic, status_code=status.HTTP_201_CREATED)
async def post_commitment(input: CommitmentCreate, user=Depends(get_current_user)):
    try:
        return await create_commitment(user.id, input)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A commitment with this name already exists")


@router.put("/{commitment_id}", response_model=CommitmentPublic)
async def put_commitment(commitment_id: str, input: CommitmentUpdate, user=Depends(get_current_user)):
    try:
        updated = await update_commitment(user.id, commitment_id, input)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A commitment with this name already exists")
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Commitment not found")
    return updated


@router.delete("/{commitment_id}")
async def remove_commitment(commitment_id: str, user=Depends(get_current_user)):
    deleted = await delete_commitment(user.id, commitment_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Commitment not found")
    return {"message": "Commitment deleted successfully"}
