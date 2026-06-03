from . import db
from datetime import datetime

class Shipment(db.Model):
    __tablename__ = 'shipments'
    id = db.Column(db.Integer, primary_key=True)
    crop_id = db.Column(db.Integer, db.ForeignKey('crops.id'), nullable=False)
    farmer_id = db.Column(db.Integer, db.ForeignKey('farmers.id'), nullable=False)
    buyer_id = db.Column(db.Integer, db.ForeignKey('buyers.id'), nullable=False)
    transporter_id = db.Column(db.Integer, db.ForeignKey('transporters.id'), nullable=True)
    status = db.Column(db.String(20), default='created') # 'created', 'assigned', 'shipped', 'delivered', 'cancelled'
    distance_km = db.Column(db.Float, nullable=True)
    transport_cost = db.Column(db.Float, nullable=True)
    suggested_price = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        from models.farmer import Farmer
        from models.buyer import Buyer
        from models.transporter import Transporter
        from models.crop import Crop

        farmer = Farmer.query.get(self.farmer_id)
        buyer = Buyer.query.get(self.buyer_id)
        transporter = Transporter.query.get(self.transporter_id) if self.transporter_id else None
        crop = Crop.query.get(self.crop_id)

        return {
            "id": self.id,
            "crop_id": self.crop_id,
            "crop_name": crop.crop_name if crop else f"Crop #{self.crop_id}",
            "farmer_id": self.farmer_id,
            "farmer_name": farmer.name if farmer else "Unknown",
            "buyer_id": self.buyer_id,
            "buyer_name": buyer.name if buyer else "Unknown",
            "transporter_id": self.transporter_id,
            "transporter_name": transporter.name if transporter else "Not Assigned",
            "status": self.status,
            "distance_km": self.distance_km,
            "transport_cost": self.transport_cost,
            "suggested_price": self.suggested_price,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
