import logging
from zoneinfo import ZoneInfo

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from starlette.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from app.api.router import api_router
from app.core.config import settings
from app.db.mongo import mongo, init_indexes
from app.services.user_service import seed_admin_user
from app.services.salary_service import credit_salaries_for_today
from app.services.commitment_deduction_service import deduct_commitments_for_today
from app.utils.errors import (
    http_exception_handler,
    validation_exception_handler,
    unhandled_exception_handler,
)


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name)
    scheduler = AsyncIOScheduler(timezone=ZoneInfo(settings.app_timezone))

    # Routers
    app.include_router(api_router)

    # CORS
    cors_origins = settings.cors_origin_list
    if cors_origins == ["*"]:
        cors_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

    app.add_middleware(
        CORSMiddleware,
        allow_credentials=True,
        allow_origins=cors_origins or ["http://localhost:3000"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Error handlers
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)

    # Lifespan events
    @app.on_event("startup")
    async def startup_event():
        mongo.connect()
        await init_indexes()
        await seed_admin_user(
            settings.admin_seed_phone,
            settings.admin_seed_password,
            settings.admin_seed_email,
            settings.admin_seed_name,
        )
        scheduler.add_job(
            credit_salaries_for_today,
            CronTrigger(hour=settings.salary_credit_hour, minute=settings.salary_credit_minute),
            id="salary-credit",
            replace_existing=True,
        )
        scheduler.add_job(
            deduct_commitments_for_today,
            CronTrigger(hour=settings.commitment_deduct_hour, minute=settings.commitment_deduct_minute),
            id="commitment-deduct",
            replace_existing=True,
        )
        scheduler.start()

    @app.on_event("shutdown")
    async def shutdown_event():
        scheduler.shutdown(wait=False)
        mongo.close()

    return app


# App instance for ASGI servers
app = create_app()


# Logging config
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
