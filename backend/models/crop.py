from . import db

class Crop(db.Model):
    __tablename__ = 'crops'
    id = db.Column(db.Integer, primary_key=True)
    farmer_id = db.Column(db.Integer, db.ForeignKey('farmers.id'), nullable=False)
    crop_name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    base_price = db.Column(db.Float, nullable=False)
    expiry_days = db.Column(db.Integer, nullable=False)
    image_url = db.Column(db.String(255), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "farmer_id": self.farmer_id,
            "crop_name": self.crop_name,
            "quantity": self.quantity,
            "base_price": self.base_price,
            "expiry_days": self.expiry_days,
            "image_url": self.image_url
        }
