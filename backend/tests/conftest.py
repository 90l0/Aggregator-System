import os

os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.models import Base

@pytest_asyncio.fixture(scope="session")
def engine():
    return create_async_engine("sqlite+aiosqlite:///:memory:", echo=True)

@pytest_asyncio.fixture(scope="session")
async def create_tables(engine):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@pytest_asyncio.fixture
async def db(engine, create_tables):
    async with engine.begin() as conn:
        async_session = sessionmaker(conn, class_=AsyncSession, expire_on_commit=False)
        async with async_session() as session:
            yield session
            await session.rollback()