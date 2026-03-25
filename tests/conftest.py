import os
import sys
import pytest
from fastapi.testclient import TestClient

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BACKEND_PATH = os.path.join(ROOT, "backend")
if BACKEND_PATH not in sys.path:
    sys.path.insert(0, BACKEND_PATH)

from app.main import app  # noqa: E402
from app.db.mongo import mongo  # noqa: E402


@pytest.fixture(scope="session")
def client():
    if not os.getenv("MONGO_URL"):
        pytest.skip("MONGO_URL not set; skipping integration tests")
    with TestClient(app) as c:
        yield c


@pytest.fixture(autouse=True)
def cleanup_db():
    if mongo._client is None:
        yield
        return
    yield
    mongo.db.users.delete_many({})
    mongo.db.transactions.delete_many({})
    mongo.db.commitments.delete_many({})
    mongo.db.budgets.delete_many({})
