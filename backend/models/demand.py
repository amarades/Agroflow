from . import db

class Demand(db.Model):
    __tablename__ = 'demands'
    id = db.Column(db.Integer, primary_key=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey('buyers.id'), nullable=False)
    crop_name = db.Column(db.String(100), nullable=False)
    required_quantity = db.Column(db.Integer, nullable=False)
    max_price = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "buyer_id": self.buyer_id,
            "crop_name": self.crop_name,
            "required_quantity": self.required_quantity,
            "max_price": self.max_price
        }
