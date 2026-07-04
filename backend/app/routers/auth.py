from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import User as UserModel
from app.schemas import UserCreate, User as UserSchema, LoginRequest, Token
from app.utils.auth import get_password_hash, create_access_token, verify_password, get_current_active_user
from datetime import timedelta
from sqlalchemy import select

router = APIRouter()

@router.post("/register", response_model=UserSchema)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    result = await db.execute(select(UserModel).where(UserModel.email == user.email))
    db_user = result.scalars().first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    role = user.role if user.role in ["super_admin", "admin", "agent", "sub_agent"] else "agent"
    db_user = UserModel(email=user.email, password_hash=hashed_password, role=role)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token)
async def login(login_request: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserModel).where(UserModel.email == login_request.email))
    user = result.scalars().first()
    if not user or not verify_password(login_request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
