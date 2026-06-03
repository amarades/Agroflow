from flask import Blueprint, request, jsonify
from models import db, Crop

crop_bp = Blueprint('crop', __name__)

@crop_bp.route('/', methods=['POST'])
def create_crop():
    data = request.json
    new_crop = Crop(
        farmer_id=data['farmer_id'],
        crop_name=data['crop_name'],
        quantity=data['quantity'],
        base_price=data['base_price'],
        expiry_days=data['expiry_days'],
        image_url=data.get('image_url')
    )
    db.session.add(new_crop)
    db.session.commit()
    return jsonify(new_crop.to_dict()), 201

@crop_bp.route('/', methods=['GET'])
def get_crops():
    crops = Crop.query.all()
    return jsonify([crop.to_dict() for crop in crops])
