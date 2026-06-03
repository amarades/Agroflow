from flask import Blueprint, request, jsonify
from models import db, Buyer

buyer_bp = Blueprint('buyer', __name__)

@buyer_bp.route('/', methods=['POST'])
def add_buyer():
    data = request.json
    new_buyer = Buyer(
        name=data['name'],
        location_x=data['location_x'],
        location_y=data['location_y']
    )
    db.session.add(new_buyer)
    db.session.commit()
    return jsonify({"message": "Buyer added successfully!", "buyer": new_buyer.to_dict()}), 201

@buyer_bp.route('/', methods=['GET'])
def get_buyers():
    buyers = Buyer.query.all()
    return jsonify([b.to_dict() for b in buyers])


@buyer_bp.route('/<int:id>', methods=['DELETE'])
def delete_buyer(id):
    buyer = Buyer.query.get(id)
    if not buyer:
        return jsonify({"error": "Not found"}), 404
    db.session.delete(buyer)
    db.session.commit()
    return jsonify({"deleted": id})
