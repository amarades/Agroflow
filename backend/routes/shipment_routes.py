from flask import Blueprint, request, jsonify
from models import db, Shipment, Crop
from services.optimizer import find_best_match, create_shipment_for_match

shipment_bp = Blueprint('shipment', __name__)

@shipment_bp.route('/', methods=['GET'])
def get_shipments():
    shipments = Shipment.query.all()
    return jsonify([s.to_dict() for s in shipments])

@shipment_bp.route('/<int:id>', methods=['GET'])
def get_shipment(id):
    shipment = Shipment.query.get(id)
    if not shipment:
        return jsonify({"message": "Shipment not found"}), 404
    return jsonify(shipment.to_dict())

@shipment_bp.route('/create_from_optimize', methods=['POST'])
def create_from_optimize():
    data = request.json or {}
    crop_id = data.get('crop_id')
    if not crop_id:
        return jsonify({"message": "Crop ID is required"}), 400

    crop = Crop.query.get(crop_id)
    if not crop:
        return jsonify({"message": "Crop not found"}), 404

    match = find_best_match(crop)
    if not match:
        return jsonify({"message": "No match found to create shipment"}), 404

    shipment_dict = create_shipment_for_match(match)
    if not shipment_dict:
        return jsonify({"message": "Failed to create shipment"}), 500

    return jsonify({"message": "Shipment created successfully!", "shipment": shipment_dict}), 201

@shipment_bp.route('/<int:id>/status', methods=['PUT'])
def update_status(id):
    data = request.json or {}
    status = data.get('status')
    if not status:
        return jsonify({"message": "Status is required"}), 400

    shipment = Shipment.query.get(id)
    if not shipment:
        return jsonify({"message": "Shipment not found"}), 404

    shipment.status = status
    
    # If shipment is marked delivered or cancelled, release the transporter
    if status in ['delivered', 'cancelled'] and shipment.transporter_id:
        from models.transporter import Transporter
        transporter = Transporter.query.get(shipment.transporter_id)
        if transporter:
            transporter.available = True

    db.session.commit()
    return jsonify({"message": f"Shipment status updated to {status}!", "shipment": shipment.to_dict()})
