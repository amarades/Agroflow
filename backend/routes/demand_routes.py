from flask import Blueprint, request, jsonify
from models import db, Demand

demand_bp = Blueprint('demand', __name__)

@demand_bp.route('/', methods=['POST'])
def add_demand():
    data = request.json
    new_demand = Demand(
        buyer_id=data['buyer_id'],
        crop_name=data['crop_name'],
        required_quantity=data['required_quantity'],
        max_price=data['max_price']
    )
    db.session.add(new_demand)
    db.session.commit()
    return jsonify({"message": "Demand added successfully!", "demand": new_demand.to_dict()}), 201

@demand_bp.route('/', methods=['GET'])
def get_demands():
    demands = Demand.query.all()
    return jsonify([d.to_dict() for d in demands])


@demand_bp.route('/<int:id>', methods=['DELETE'])
def delete_demand(id):
    demand = Demand.query.get(id)
    if not demand:
        return jsonify({"error": "Not found"}), 404
    db.session.delete(demand)
    db.session.commit()
    return jsonify({"deleted": id})
