from datetime import datetime, timezone
from zoneinfo import ZoneInfo
import calendar
import uuid

from app.core.config import settings
from app.db.mongo import mongo


def _current_month_key(dt: datetime) -> str:
    return f"{dt.year:04d}-{dt.month:02d}"


async def deduct_commitments_for_today() -> int:
    tz = ZoneInfo(settings.app_timezone)
    now = datetime.now(tz)
    today_day = now.day
    month_key = _current_month_key(now)
    last_day = calendar.monthrange(now.year, now.month)[1]
    allow_ge = today_day == last_day

    commitments = await mongo.db.commitments.find(
        {
            "amount": {"$gt": 0},
            "deductionDate": {"$gte": today_day} if allow_ge else today_day,
            "$or": [
                {"lastDeductedMonth": {"$ne": month_key}},
                {"lastDeductedMonth": {"$exists": False}},
            ],
        },
        {"_id": 0},
    ).to_list(5000)

    if not commitments:
        return 0

    count = 0
    for c in commitments:
        user_id = c["userId"]
        amount = float(c.get("amount") or 0)
        if amount <= 0:
            continue

        txn = {
            "id": str(uuid.uuid4()),
            "userId": user_id,
            "type": "spend",
            "category": "Commitments",
            "reason": None,
            "amount": amount,
            "date": now.date().isoformat(),
            "description": f"Commitment: {c.get('name','')}",
            "createdAt": datetime.now(timezone.utc).isoformat(),
        }
        await mongo.db.transactions.insert_one(txn)

        await mongo.db.users.update_one(
            {"id": user_id},
            {"$inc": {"walletBalance": -amount}},
        )

        await mongo.db.commitments.update_one(
            {"id": c["id"]},
            {"$set": {"lastDeductedMonth": month_key, "lastDeductedAt": now.date().isoformat()}},
        )

        count += 1

    return count
