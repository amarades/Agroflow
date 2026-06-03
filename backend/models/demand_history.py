from . import db
from datetime import datetime

class DemandHistory(db.Model):
    __tablename__ = 'demand_history'
    id = db.Column(db.Integer, primary_key=True)
    crop_name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "crop_name": self.crop_name,
            "quantity": self.quantity,
            "date": self.date.isoformat() if self.date else None
        }
