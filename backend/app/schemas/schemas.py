from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import uuid

class UserBase(BaseModel):
    email: EmailStr
    role: str

class UserCreate(UserBase):
    password: str
    role: str = "agent"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class User(UserBase):
    id: uuid.UUID
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AgentBase(BaseModel):
    name: str
    contact_info: str
    geo_lat: Optional[float] = None
    geo_long: Optional[float] = None
    parent_agent_id: Optional[uuid.UUID] = None

class AgentCreate(AgentBase):
    user_id: Optional[uuid.UUID] = None

class Agent(AgentBase):
    id: uuid.UUID
    user_id: uuid.UUID
    status: str

    class Config:
        from_attributes = True

class SaleBase(BaseModel):
    product_type: str
    amount: float
    geo_lat: Optional[float] = None
    geo_long: Optional[float] = None

class SaleCreate(SaleBase):
    agent_id: uuid.UUID

class Sale(SaleBase):
    id: uuid.UUID
    agent_id: uuid.UUID
    timestamp: datetime

    class Config:
        from_attributes = True

class ActivationBase(BaseModel):
    sim_number: str

class ActivationCreate(ActivationBase):
    agent_id: uuid.UUID

class Activation(ActivationBase):
    id: uuid.UUID
    agent_id: uuid.UUID
    activation_date: datetime
    status: str

    class Config:
        from_attributes = True

class FraudAlertBase(BaseModel):
    alert_type: str
    description: str

class FraudAlertCreate(FraudAlertBase):
    agent_id: uuid.UUID

class FraudAlert(FraudAlertBase):
    id: uuid.UUID
    agent_id: uuid.UUID
    timestamp: datetime
    resolved: bool

    class Config:
        from_attributes = True