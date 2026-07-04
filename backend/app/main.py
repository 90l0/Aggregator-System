from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import structlog
import socketio
import os
from sqlalchemy import select, update, insert, text
from app.socket import sio
from app.database import engine
from app.models import Base, User as UserModel
from app.utils.auth import get_password_hash

# Configure logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

app = FastAPI(title="AIMS API", version="1.0.0")
DEFAULT_ADMIN_EMAIL = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@lyca.com")
LEGACY_ADMIN_EMAIL = "admin@lyca.local"

# SocketIO for real-time
socket_app = socketio.ASGIApp(sio, app)

# Rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Add production URLs later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
from app.routers import auth, agents, sales, analytics, fraud
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(agents.router, prefix="/agents", tags=["agents"])
app.include_router(sales.router, prefix="/api", tags=["sales"])
app.include_router(analytics.router, prefix="/api", tags=["analytics"])
app.include_router(fraud.router, prefix="/api", tags=["fraud"])

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        result = await conn.execute(select(UserModel.email).where(UserModel.email == DEFAULT_ADMIN_EMAIL))
        admin_email = result.scalar_one_or_none()

        if admin_email is None:
            legacy_result = await conn.execute(select(UserModel.email).where(UserModel.email == LEGACY_ADMIN_EMAIL))
            legacy_email = legacy_result.scalar_one_or_none()
            if legacy_email is not None:
                await conn.execute(
                    update(UserModel).where(UserModel.email == LEGACY_ADMIN_EMAIL).values(email=DEFAULT_ADMIN_EMAIL)
                )
                admin_email = DEFAULT_ADMIN_EMAIL

        if admin_email is None:
            hashed_password = get_password_hash("LycaAdmin@2026")
            await conn.execute(
                insert(UserModel),
                {"email": DEFAULT_ADMIN_EMAIL, "password_hash": hashed_password, "role": "super_admin"},
            )

@app.get("/")
async def root():
    return {"message": "AIMS API is running"}

@app.get("/health")
async def health():
    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        return {"status": "ok"}
    except Exception as exc:
        raise HTTPException(status_code=503, detail="service unavailable") from exc

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(socket_app, host="0.0.0.0", port=8000)
