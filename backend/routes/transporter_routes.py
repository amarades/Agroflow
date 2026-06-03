from flask import Blueprint, request, jsonify
from models import db, Transporter

transporter_bp = Blueprint('transporter', __name__)

@transporter_bp.route('/', methods=['GET'])
def get_transporters():
    transporters = Transporter.query.all()
    return jsonify([t.to_dict() for t in transporters])

@transporter_bp.route('/', methods=['POST'])
def add_transporter():
    data = request.json or {}
    name = data.get('name')
    phone = data.get('phone')
    vehicle_type = data.get('vehicle_type')
    location_x = float(data.get('location_x', 0))
    location_y = float(data.get('location_y', 0))

    if not name:
        return jsonify({"message": "Name is required"}), 400

    new_transporter = Transporter(
        name=name,
        phone=phone,
        vehicle_type=vehicle_type,
        location_x=location_x,
        location_y=location_y,
        available=True
    )
    db.session.add(new_transporter)
    db.session.commit()

    return jsonify({"message": "Transporter added successfully!", "transporter": new_transporter.to_dict()}), 201
