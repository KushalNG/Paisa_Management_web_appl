from collections import defaultdict
from datetime import date, datetime, timedelta, timezone
import calendar

from app.db.mongo import mongo
from app.schemas.dashboard import (
    BudgetInfo,
    CategoryExpense,
    DashboardStats,
    ExceededBudget,
    UpcomingCommitment,
)


def _month_key(dt: date) -> str:
    return f"{dt.year:04d}-{dt.month:02d}"


def _month_label(dt: date) -> str:
    return calendar.month_abbr[dt.month]


def _next_deduction_date(deduction_day: int) -> date:
    today = date.today()
    year = today.year
    month = today.month
    if today.day >= deduction_day:
        month += 1
        if month > 12:
            month = 1
            year += 1
    # clamp day to last day of month
    last_day = calendar.monthrange(year, month)[1]
    day = min(deduction_day, last_day)
    return date(year, month, day)


def _parse_month(month: str) -> tuple[date, date]:
    year, month_num = month.split("-")
    y = int(year)
    m = int(month_num)
    start = date(y, m, 1)
    last_day = calendar.monthrange(y, m)[1]
    end = date(y, m, last_day)
    return start, end


def _resolve_date_range(
    user_created_at: datetime | None,
    month: str | None,
    start_date: date | None,
    end_date: date | None,
    till_date: bool,
) -> tuple[date | None, date | None]:
    if start_date or end_date:
        return start_date, end_date
    if till_date:
        start = user_created_at.date() if isinstance(user_created_at, datetime) else None
        return start, date.today()
    if month:
        return _parse_month(month)
    return None, None


async def get_dashboard_stats(
    user_id: str,
    user_created_at: datetime | None,
    month: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    till_date: bool = False,
) -> DashboardStats:
    user = await mongo.db.users.find_one({"id": user_id}, {"_id": 0})
    wallet_balance = float(user.get("walletBalance", 0)) if user else 0

    # Transactions
    txns = await mongo.db.transactions.find({"userId": user_id}, {"_id": 0}).to_list(5000)
    range_start, range_end = _resolve_date_range(user_created_at, month, start_date, end_date, till_date)

    def _in_range(txn_date: date) -> bool:
        if range_start and txn_date < range_start:
            return False
        if range_end and txn_date > range_end:
            return False
        return True

    total_income = 0
    total_expense = 0
    filtered_txns = []
    for t in txns:
        txn_date = t["date"]
        if isinstance(txn_date, datetime):
            txn_date = txn_date.date()
        if isinstance(txn_date, str):
            txn_date = date.fromisoformat(txn_date)
        if not _in_range(txn_date):
            continue
        filtered_txns.append({**t, "date": txn_date})
        if t["type"] == "receive":
            total_income += float(t["amount"])
        elif t["type"] == "spend":
            total_expense += float(t["amount"])

    category_totals: dict[str, float] = defaultdict(float)
    for t in filtered_txns:
        if t["type"] == "spend" and t.get("category"):
            category_totals[t["category"]] += float(t["amount"])
    category_expenses = [CategoryExpense(category=k, amount=v) for k, v in category_totals.items()]

    # Trends (grouped by month within range)
    trends_map: dict[str, dict[str, float]] = defaultdict(lambda: defaultdict(float))
    for t in filtered_txns:
        if t["type"] != "spend" or not t.get("category"):
            continue
        txn_date = t["date"]
        label = _month_label(txn_date)
        trends_map[label][t["category"]] += float(t["amount"])

    trends = []
    for label, values in trends_map.items():
        row = {"month": label}
        row.update(values)
        trends.append(row)

    # Budgets (current month)
    current_month = _month_key(date.today())
    month_key = month or current_month
    budgets_docs = await mongo.db.budgets.find({"userId": user_id, "month": month_key}, {"_id": 0}).to_list(1000)
    budgets = [BudgetInfo(category=b["category"], budget=float(b["budgetAmount"]), spent=float(b.get("spent", 0))) for b in budgets_docs]

    # Compute spent per category within range
    month_spent: dict[str, float] = defaultdict(float)
    for t in filtered_txns:
        if t["type"] != "spend":
            continue
        txn_date = t["date"]
        if range_start or range_end or till_date:
            if t.get("category"):
                month_spent[t["category"]] += float(t["amount"])
        else:
            if _month_key(txn_date) == month_key and t.get("category"):
                month_spent[t["category"]] += float(t["amount"])

    exceeded = []
    for b in budgets_docs:
        spent = month_spent.get(b["category"], 0)
        if spent > float(b["budgetAmount"]):
            exceeded.append(
                ExceededBudget(
                    category=b["category"],
                    budget=float(b["budgetAmount"]),
                    spent=spent,
                    excess=spent - float(b["budgetAmount"]),
                )
            )

    # Upcoming commitments (due tomorrow)
    tomorrow = date.today() + timedelta(days=1)
    commitments = await mongo.db.commitments.find(
        {"userId": user_id, "reminderEnabled": True}, {"_id": 0}
    ).to_list(1000)
    upcoming = []
    for c in commitments:
        due = _next_deduction_date(int(c["deductionDate"]))
        if due == tomorrow:
            upcoming.append(
                UpcomingCommitment(
                    name=c["name"],
                    amount=float(c["amount"]),
                    dueDate=due.isoformat(),
                )
            )

    return DashboardStats(
        walletBalance=wallet_balance,
        totalIncome=total_income,
        totalExpense=total_expense,
        categoryExpenses=category_expenses,
        trends=trends,
        budgets=budgets,
        upcomingCommitments=upcoming,
        exceededBudgets=exceeded,
    )


async def get_dashboard_budgets(
    user_id: str,
    user_created_at: datetime | None,
    month: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    till_date: bool = False,
):
    today = date.today()
    current_month = _month_key(today)
    month_key = month or current_month
    budgets_docs = await mongo.db.budgets.find(
        {"userId": user_id, "month": month_key}, {"_id": 0}
    ).to_list(1000)

    txns = await mongo.db.transactions.find(
        {"userId": user_id, "type": "spend"}, {"_id": 0}
    ).to_list(5000)

    range_start, range_end = _resolve_date_range(user_created_at, month, start_date, end_date, till_date)

    month_spent: dict[str, float] = defaultdict(float)
    for t in txns:
        txn_date = t["date"]
        if isinstance(txn_date, datetime):
            txn_date = txn_date.date()
        if isinstance(txn_date, str):
            txn_date = date.fromisoformat(txn_date)
        if range_start or range_end or till_date:
            if range_start and txn_date < range_start:
                continue
            if range_end and txn_date > range_end:
                continue
            if t.get("category"):
                month_spent[t["category"]] += float(t["amount"])
        else:
            if _month_key(txn_date) == month_key and t.get("category"):
                month_spent[t["category"]] += float(t["amount"])

    budgets = []
    for b in budgets_docs:
        budgets.append(
            BudgetInfo(
                category=b["category"],
                budget=float(b["budgetAmount"]),
                spent=month_spent.get(b["category"], 0),
            )
        )
    return budgets
