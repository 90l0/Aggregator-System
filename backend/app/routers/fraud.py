from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import FraudAlert
from app.utils.auth import get_current_active_user
from app.models import User
from typing import List
from sqlalchemy import select

router = APIRouter()

@router.get("/fraud_alerts", response_model=List[dict])
async def read_fraud_alerts(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    if current_user.role not in ["super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    alerts = await db.execute(select(FraudAlert))
    return [{"id": a.id, "alert_type": a.alert_type, "description": a.description, "resolved": a.resolved} for a in alerts.scalars().all()]

@router.put("/fraud_alerts/{alert_id}/resolve")
async def resolve_alert(alert_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    if current_user.role not in ["super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    alert = await db.execute(select(FraudAlert).where(FraudAlert.id == alert_id))
    alert = alert.scalars().first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.resolved = True
    await db.commit()
    return {"message": "Alert resolved"}
