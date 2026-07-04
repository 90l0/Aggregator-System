from sqlalchemy import Column, String, DateTime, Boolean, Float, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from geoalchemy2 import Geometry
import uuid
import os
import re
from . import Base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./aims.db")
POINT_TYPE = String if DATABASE_URL.startswith("sqlite") else Geometry("POINT", srid=4326)
POINT_PATTERN = re.compile(r"^POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)$", re.IGNORECASE)


def parse_point(value):
    if value is None:
        return (None, None)

    candidate = value.desc if hasattr(value, "desc") else value
    if not isinstance(candidate, str):
        return (None, None)

    match = POINT_PATTERN.match(candidate.strip())
    if not match:
        return (None, None)

    try:
        lng = float(match.group(1))
        lat = float(match.group(2))
    except ValueError:
        return (None, None)

    return (lat, lng)


class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String)  # super_admin, admin, agent, sub_agent
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True)


class Agent(Base):
    __tablename__ = "agents"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    name = Column(String)
    contact_info = Column(Text)
    # SQLite does not provide PostGIS/SpatiaLite geometry functions by default.
    location = Column(POINT_TYPE)  # WGS84 lat/lng
    parent_agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=True)
    status = Column(String, default="active")

    @property
    def geo_lat(self):
        lat, _ = parse_point(self.location)
        return lat

    @property
    def geo_long(self):
        _, lng = parse_point(self.location)
        return lng


class Sale(Base):
    __tablename__ = "sales"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id"))
    product_type = Column(String)  # SIM, airtime, data
    amount = Column(Float)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    location = Column(POINT_TYPE)  # WGS84 lat/lng


class Activation(Base):
    __tablename__ = "activations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id"))
    sim_number = Column(String, unique=True)
    activation_date = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="pending")


class FraudAlert(Base):
    __tablename__ = "fraud_alerts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id"))
    alert_type = Column(String)
    description = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    resolved = Column(Boolean, default=False)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    action = Column(String)
    details = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
