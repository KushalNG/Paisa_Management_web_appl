import os
from pathlib import Path
from dotenv import load_dotenv


ROOT_DIR = Path(__file__).resolve().parents[2]
ENV_PATH = ROOT_DIR / ".env"

# Load .env if present
load_dotenv(ENV_PATH)


class Settings:
    def __init__(self) -> None:
        self.app_name = os.getenv("APP_NAME", "Paisa-Management API")
        self.env = os.getenv("ENV", "development")
        self.mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
        self.db_name = os.getenv("DB_NAME", "paisa_management")
        self.cors_origins = os.getenv("CORS_ORIGINS", "*")
        self.jwt_secret = os.getenv("JWT_SECRET", "change-me")
        self.jwt_algorithm = os.getenv("JWT_ALGORITHM", "HS256")
        self.jwt_expires_minutes = int(os.getenv("JWT_EXPIRES_MINUTES", "1440"))
        self.admin_seed_phone = os.getenv("ADMIN_SEED_PHONE", "")
        self.admin_seed_password = os.getenv("ADMIN_SEED_PASSWORD", "")
        self.admin_seed_email = os.getenv("ADMIN_SEED_EMAIL", "admin@paisa.com")
        self.admin_seed_name = os.getenv("ADMIN_SEED_NAME", "Admin User")
        self.app_timezone = os.getenv("APP_TIMEZONE", "Asia/Kolkata")
        self.salary_credit_hour = int(os.getenv("SALARY_CREDIT_HOUR", "11"))
        self.salary_credit_minute = int(os.getenv("SALARY_CREDIT_MINUTE", "0"))
        self.commitment_deduct_hour = int(os.getenv("COMMITMENT_DEDUCT_HOUR", "12"))
        self.commitment_deduct_minute = int(os.getenv("COMMITMENT_DEDUCT_MINUTE", "0"))
        self.cookie_secure = os.getenv("COOKIE_SECURE", "false").lower() == "true"
        self.cookie_samesite = os.getenv("COOKIE_SAMESITE", "lax")

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
