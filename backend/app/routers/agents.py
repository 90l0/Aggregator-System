from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import Agent as AgentModel, User as UserModel
from app.schemas import AgentCreate, Agent, AgentBase
from app.utils.auth import get_current_active_user
from typing import List
from sqlalchemy import select

router = APIRouter()


def build_point_wkt(geo_lat: float, geo_long: float) -> str:
    return f"POINT({geo_long} {geo_lat})"


def validate_coordinates(geo_lat: float, geo_long: float):
    if geo_lat < -90 or geo_lat > 90:
        raise HTTPException(status_code=422, detail="geo_lat must be between -90 and 90")
    if geo_long < -180 or geo_long > 180:
        raise HTTPException(status_code=422, detail="geo_long must be between -180 and 180")


@router.post("/", response_model=Agent)
async def create_agent(agent: AgentCreate, db: AsyncSession = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    # Check permissions: only admins can create agents
    if current_user.role not in ["super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    agent_data = agent.model_dump()
    geo_lat = agent_data.pop("geo_lat", None)
    geo_long = agent_data.pop("geo_long", None)

    if (geo_lat is None) != (geo_long is None):
        raise HTTPException(status_code=422, detail="Both geo_lat and geo_long are required together")

    if geo_lat is not None and geo_long is not None:
        validate_coordinates(geo_lat, geo_long)
        agent_data["location"] = build_point_wkt(geo_lat, geo_long)

    if not agent_data.get("user_id"):
        agent_data["user_id"] = current_user.id

    db_agent = AgentModel(**agent_data)
    db.add(db_agent)
    await db.commit()
    await db.refresh(db_agent)
    return db_agent


@router.get("/", response_model=List[Agent])
async def read_agents(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    agents = await db.execute(select(AgentModel).offset(skip).limit(limit))
    return agents.scalars().all()


@router.get("/{agent_id}", response_model=Agent)
async def read_agent(agent_id: str, db: AsyncSession = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    agent = await db.execute(select(AgentModel).where(AgentModel.id == agent_id))
    agent = agent.scalars().first()
    if agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.put("/{agent_id}", response_model=Agent)
async def update_agent(agent_id: str, agent_update: AgentBase, db: AsyncSession = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    if current_user.role not in ["super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    agent = await db.execute(select(AgentModel).where(AgentModel.id == agent_id))
    agent = agent.scalars().first()
    if agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")

    update_data = agent_update.model_dump(exclude_unset=True)
    has_geo_lat = "geo_lat" in update_data
    has_geo_long = "geo_long" in update_data
    geo_lat = update_data.pop("geo_lat", None)
    geo_long = update_data.pop("geo_long", None)

    if has_geo_lat != has_geo_long:
        raise HTTPException(status_code=422, detail="Both geo_lat and geo_long are required together")

    if has_geo_lat and has_geo_long:
        if geo_lat is None and geo_long is None:
            agent.location = None
        else:
            validate_coordinates(geo_lat, geo_long)
            agent.location = build_point_wkt(geo_lat, geo_long)

    for key, value in update_data.items():
        setattr(agent, key, value)

    await db.commit()
    await db.refresh(agent)
    return agent
