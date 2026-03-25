from datetime import date
from typing import Optional, List
import csv
import io

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from starlette import status

from app.deps import get_current_user
from app.schemas.transaction import TransactionCreate, TransactionPublic
from app.services.transaction_service import (
    create_transaction,
    delete_transaction,
    list_transactions,
)


router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("", response_model=List[TransactionPublic])
async def get_transactions(
    category: Optional[str] = None,
    startDate: Optional[date] = Query(default=None),
    endDate: Optional[date] = Query(default=None),
    minAmount: Optional[float] = Query(default=None),
    maxAmount: Optional[float] = Query(default=None),
    user=Depends(get_current_user),
):
    return await list_transactions(
        user_id=user.id,
        category=category,
        start_date=startDate,
        end_date=endDate,
        min_amount=minAmount,
        max_amount=maxAmount,
    )


@router.post("", response_model=TransactionPublic, status_code=status.HTTP_201_CREATED)
async def post_transaction(input: TransactionCreate, user=Depends(get_current_user)):
    if input.type == "spend" and not input.category:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Category required for spend")
    if input.type == "receive" and not input.reason:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Reason required for receive")
    return await create_transaction(user_id=user.id, input=input)


@router.delete("/{transaction_id}")
async def remove_transaction(transaction_id: str, user=Depends(get_current_user)):
    deleted = await delete_transaction(user_id=user.id, transaction_id=transaction_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return {"message": "Transaction deleted successfully"}


@router.get("/export")
async def export_transactions(
    format: str = Query(default="csv"),
    category: Optional[str] = None,
    startDate: Optional[date] = Query(default=None),
    endDate: Optional[date] = Query(default=None),
    user=Depends(get_current_user),
):
    fmt = format.lower()
    if fmt != "csv":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only CSV export is supported")

    txns = await list_transactions(
        user_id=user.id,
        category=category,
        start_date=startDate,
        end_date=endDate,
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Type", "Category", "Amount", "Description"])
    for t in txns:
        writer.writerow(
            [
                t.date.isoformat(),
                t.type,
                t.category or t.reason or "-",
                t.amount,
                t.description or "-",
            ]
        )
    output.seek(0)
    headers = {"Content-Disposition": "attachment; filename=transactions.csv"}
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers=headers)
