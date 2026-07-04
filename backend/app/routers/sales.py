from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import Sale as SaleModel, Activation as ActivationModel, FraudAlert as FraudAlertModel, User as UserModel
from app.schemas import SaleCreate, Sale, ActivationCreate, Activation
from app.utils.auth import get_current_active_user
from typing import List
import structlog
from app.socket import sio  # Import sio for broadcasting
from app.services.fraud_detection import fraud_detector
from datetime import datetime
from sqlalchemy import select

logger = structlog.get_logger()

router = APIRouter()

@router.post("/sales", response_model=Sale)
async def create_sale(sale: SaleCreate, db: AsyncSession = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    # Check if agent belongs to user or user is admin
    if current_user.role not in ["super_admin", "admin"] and str(sale.agent_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized for this agent")
    
    db_sale = SaleModel(**sale.dict())
    db.add(db_sale)
    await db.commit()
    await db.refresh(db_sale)
    
    # Fraud detection: Use ML model
    await fraud_detector.train_model(db)  # Retrain periodically in production
    hour = datetime.now().hour
    if fraud_detector.detect_anomaly(sale.amount, hour):
        alert = FraudAlertModel(agent_id=sale.agent_id, alert_type="anomaly", description=f"Anomalous sale detected: amount {sale.amount} at hour {hour}")
        db.add(alert)
        await db.commit()
        logger.warning("Fraud alert created", agent_id=str(sale.agent_id), alert_type="anomaly")
        # Broadcast fraud alert
        await sio.emit('fraud_alert', {'agent_id': str(sale.agent_id), 'type': 'anomaly'})
    
    # Broadcast new sale
    await sio.emit('new_sale', {'amount': sale.amount, 'product_type': sale.product_type})
    
    return db_sale

@router.get("/sales", response_model=List[Sale])
async def read_sales(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    sales = await db.execute(select(SaleModel).offset(skip).limit(limit))
    return sales.scalars().all()

@router.post("/activations", response_model=Activation)
async def create_activation(activation: ActivationCreate, db: AsyncSession = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    if current_user.role not in ["super_admin", "admin"] and str(activation.agent_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized for this agent")
    
    db_activation = ActivationModel(**activation.dict())
    db.add(db_activation)
    await db.commit()
    await db.refresh(db_activation)
    # Broadcast new activation
    await sio.emit('new_activation', {'sim_number': activation.sim_number})
    return db_activation

@router.get("/activations", response_model=List[Activation])
async def read_activations(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    activations = await db.execute(select(ActivationModel).offset(skip).limit(limit))
    return activations.scalars().all()
