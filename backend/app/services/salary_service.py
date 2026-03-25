from datetime import datetime, timezone, date
from zoneinfo import ZoneInfo
import uuid
import calendar

from app.core.config import settings
from app.db.mongo import mongo


def _current_month_key(dt: datetime) -> str:
    return f"{dt.year:04d}-{dt.month:02d}"


async def credit_salaries_for_today() -> int:
    tz = ZoneInfo(settings.app_timezone)
    now = datetime.now(tz)
    today_day = now.day
    month_key = _current_month_key(now)
    last_day = calendar.monthrange(now.year, now.month)[1]
    allow_ge = today_day == last_day

    users = await mongo.db.users.find(
        {
            "salary": {"$gt": 0},
            "salaryDate": {"$gte": today_day} if allow_ge else today_day,
            "$or": [
                {"lastSalaryCreditedMonth": {"$ne": month_key}},
                {"lastSalaryCreditedMonth": {"$exists": False}},
            ],
        },
        {"_id": 0},
    ).to_list(5000)

    if not users:
        return 0

    count = 0
    for user in users:
        user_id = user["id"]
        amount = float(user.get("salary") or 0)
        if amount <= 0:
            continue

        # Create a salary transaction
        txn = {
            "id": str(uuid.uuid4()),
            "userId": user_id,
            "type": "receive",
            "category": None,
            "reason": "Salary",
            "amount": amount,
            "date": now.date().isoformat(),
            "description": "Monthly salary credit",
            "createdAt": datetime.now(timezone.utc).isoformat(),
        }
        await mongo.db.transactions.insert_one(txn)

        await mongo.db.users.update_one(
            {"id": user_id},
            {
                "$inc": {"walletBalance": amount},
                "$set": {"lastSalaryCreditedMonth": month_key},
            },
        )
        count += 1

    return count
