import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import User
from app.utils.auth import get_password_hash

@pytest.mark.asyncio
async def test_create_user(db: AsyncSession):
    user = User(
        email="test@example.com",
        password_hash=get_password_hash("password"),
        role="admin"
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    assert user.id is not None
    assert user.email == "test@example.com"