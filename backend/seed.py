import os
import bcrypt
from app import app
from models import db, Farmer, Buyer, Crop, Demand, Transporter, PriceHistory
from datetime import datetime, timedelta
import numpy as np

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def seed():
    with app.app_context():
        db.drop_all()
        db.create_all()

        print("Seeding database...")

        f = Farmer(
            name="Rajesh Patel",
            email="rajesh@farm.com",
            password_hash=hash_password("password123"),
            location_x=12.9716,
            location_y=77.5946
        )
        db.session.add(f)

        b = Buyer(
            name="Metro Supermarket",
            email="metro@buy.com",
            password_hash=hash_password("password123"),
            location_x=13.0358,
            location_y=77.5978
        )
        db.session.add(b)

        db.session.commit()

        c1 = Crop(
            farmer_id=f.id,
            crop_name="Tomato",
            quantity=100.0,
            base_price=20.0,
            expiry_days=3,
            image_url="/api/upload/files/tomato.jpg"
        )
        c2 = Crop(
            farmer_id=f.id,
            crop_name="Apple",
            quantity=150.0,
            base_price=80.0,
            expiry_days=10,
            image_url="/api/upload/files/apple.jpg"
        )
        c3 = Crop(
            farmer_id=f.id,
            crop_name="Carrot",
            quantity=50.0,
            base_price=35.0,
            expiry_days=2,
            image_url="/api/upload/files/carrot.jpg"
        )
        db.session.add_all([c1, c2, c3])

        d1 = Demand(
            buyer_id=b.id,
            crop_name="Tomato",
            required_quantity=80,
            max_price=30.0
        )
        d2 = Demand(
            buyer_id=b.id,
            crop_name="Apple",
            required_quantity=100,
            max_price=120.0
        )
        d3 = Demand(
            buyer_id=b.id,
            crop_name="Wheat",
            required_quantity=500,
            max_price=28.0
        )
        db.session.add_all([d1, d2, d3])

        t1 = Transporter(
            name="Karan Logistics",
            phone="+91 98765 43210",
            vehicle_type="Mini Truck",
            location_x=12.9800,
            location_y=77.6000,
            available=True
        )
        t2 = Transporter(
            name="Rahul Transports",
            phone="+91 99999 88888",
            vehicle_type="Heavy Truck",
            location_x=13.0000,
            location_y=77.5800,
            available=True
        )
        db.session.add_all([t1, t2])

        crops_list = ['Apple', 'Carrot', 'Wheat', 'Tomato', 'Potato']
        now = datetime.utcnow()
        for crop in crops_list:
            base_price = 25.0 if crop in ['Tomato', 'Potato'] else 40.0 if crop == 'Carrot' else 80.0 if crop == 'Apple' else 20.0
            for m in range(12):
                date = now - timedelta(days=(11 - m) * 30)
                trend = m * 0.5
                seasonal = base_price * 0.1 * np.sin(2 * np.pi * (m / 12))
                price = round(base_price + trend + seasonal + np.random.normal(0, 1), 2)
                
                ph = PriceHistory(crop_name=crop, price=max(5.0, price), date=date)
                db.session.add(ph)

        db.session.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    seed()
