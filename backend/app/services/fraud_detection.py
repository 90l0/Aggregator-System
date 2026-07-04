from sklearn.ensemble import IsolationForest
import numpy as np
from typing import List, Dict
from app.models import Sale
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

class FraudDetector:
    def __init__(self):
        self.model = IsolationForest(contamination=0.1, random_state=42)

    async def train_model(self, db: AsyncSession):
        # Fetch historical sales data
        result = await db.execute(select(Sale.amount, Sale.timestamp))
        sales = result.all()
        
        if len(sales) < 10:
            return  # Not enough data
        
        # Prepare features: amount and hour of day
        features = []
        for sale in sales:
            hour = sale.timestamp.hour
            features.append([sale.amount, hour])
        
        self.model.fit(features)

    def detect_anomaly(self, amount: float, hour: int) -> bool:
        prediction = self.model.predict([[amount, hour]])
        return prediction[0] == -1  # -1 indicates anomaly

fraud_detector = FraudDetector()