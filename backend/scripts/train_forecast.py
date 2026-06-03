import os
import pickle
import numpy as np
from datetime import datetime, timedelta
from sklearn.linear_model import LinearRegression
from models import db, PriceHistory

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'forecast_models')
os.makedirs(MODEL_DIR, exist_ok=True)

def seed_historical_data():
    count = PriceHistory.query.count()
    if count > 0:
        return
        
    crops = ['Apple', 'Carrot', 'Wheat', 'Tomato', 'Potato']
    now = datetime.utcnow()
    
    for crop in crops:
        base_price = 25.0 if crop in ['Tomato', 'Potato'] else 40.0 if crop == 'Carrot' else 80.0 if crop == 'Apple' else 20.0
        for m in range(12):
            date = now - timedelta(days=(11 - m) * 30)
            trend = m * 0.5
            seasonal = base_price * 0.1 * np.sin(2 * np.pi * (m / 12))
            price = round(base_price + trend + seasonal + np.random.normal(0, 1), 2)
            
            ph = PriceHistory(crop_name=crop, price=max(5.0, price), date=date)
            db.session.add(ph)
            
    db.session.commit()

def train_models():
    seed_historical_data()
    
    histories = PriceHistory.query.all()
    if not histories:
        return []

    crop_data = {}
    for h in histories:
        name = h.crop_name.replace(' ', '_')
        if name not in crop_data:
            crop_data[name] = []
        crop_data[name].append((h.date, h.price))

    trained = []
    for crop_name, data in crop_data.items():
        if len(data) < 2:
            continue
            
        data.sort(key=lambda x: x[0])
        
        X = np.arange(len(data)).reshape(-1, 1)
        y = np.array([x[1] for x in data])
        
        model = LinearRegression()
        model.fit(X, y)
        
        model_path = os.path.join(MODEL_DIR, f"{crop_name}.pkl")
        with open(model_path, 'wb') as f:
            pickle.dump(model, f)
            
        trained.append(crop_name)
        
    return trained
