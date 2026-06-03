from . import db

class Transporter(db.Model):
    __tablename__ = 'transporters'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    vehicle_type = db.Column(db.String(50), nullable=True)
    location_x = db.Column(db.Float, nullable=False)
    location_y = db.Column(db.Float, nullable=False)
    available = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "phone": self.phone,
            "vehicle_type": self.vehicle_type,
            "location_x": self.location_x,
            "location_y": self.location_y,
            "available": self.available
        }
