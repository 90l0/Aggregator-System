import os
import pathlib

TEST_DB_PATH = pathlib.Path(__file__).resolve().parent / "test_app.db"
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{TEST_DB_PATH.as_posix()}"

import pytest
import pytest_asyncio
from httpx import AsyncClient
from app.main import app
from app.database import engine
from app.models import Base

@pytest_asyncio.fixture(scope="session", autouse=True)
async def create_app_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()

@pytest.mark.asyncio
async def test_root():
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        response = await client.get("/")
        assert response.status_code == 200
        assert response.json() == {"message": "AIMS API is running"}

@pytest.mark.asyncio
async def test_register_user():
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        response = await client.post("/auth/register", json={
            "email": "test@example.com",
            "password": "password123",
            "role": "admin"
        })
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["email"] == "test@example.com"