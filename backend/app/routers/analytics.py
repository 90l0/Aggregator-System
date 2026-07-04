from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models import Sale, Activation, FraudAlert
from app.utils.auth import get_current_active_user
from app.models import User

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_data(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    sales_total_result = await db.execute(select(func.coalesce(func.sum(Sale.amount), 0)))
    sales_total = sales_total_result.scalar_one()

    activations_count_result = await db.execute(select(func.count(Activation.id)))
    activations_count = activations_count_result.scalar_one()

    alerts_count_result = await db.execute(select(func.count(FraudAlert.id)).where(FraudAlert.resolved == False))
    alerts_count = alerts_count_result.scalar_one()

    return {
        "total_sales": sales_total,
        "total_activations": activations_count,
        "active_fraud_alerts": alerts_count
    }

@router.get("/sales/analytics")
async def get_sales_analytics(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    result = await db.execute(
        select(Sale.product_type, func.sum(Sale.amount).label("total")).group_by(Sale.product_type)
    )
    analytics = {row.product_type: row.total for row in result}
    return analytics