from flask import Blueprint, request, jsonify
from models import db, Bid, Crop, Farmer, Buyer

bid_bp = Blueprint('bids', __name__)

@bid_bp.route('/', methods=['GET'])
def get_bids():
    buyer_id = request.args.get('buyer_id')
    crop_id = request.args.get('crop_id')
    farmer_id = request.args.get('farmer_id')

    query = Bid.query
    if buyer_id:
        query = query.filter_by(buyer_id=buyer_id)
    if crop_id:
        query = query.filter_by(crop_id=crop_id)
    if farmer_id:
        query = query.join(Crop).filter(Crop.farmer_id == farmer_id)

    bids = query.all()
    results = []
    for b in bids:
        crop = Crop.query.get(b.crop_id)
        buyer = Buyer.query.get(b.buyer_id)
        
        b_dict = b.to_dict()
        b_dict['crop_name'] = crop.crop_name if crop else f"Crop #{b.crop_id}"
        b_dict['buyer_name'] = buyer.name if buyer else "Unknown Buyer"
        results.append(b_dict)

    return jsonify(results)

@bid_bp.route('/', methods=['POST'])
def create_bid():
    data = request.json or {}
    crop_id = data.get('crop_id')
    buyer_id = data.get('buyer_id')
    bid_price = float(data.get('bid_price', 0))
    quantity = float(data.get('quantity', 0))

    if not crop_id or not buyer_id or bid_price <= 0 or quantity <= 0:
        return jsonify({"message": "Invalid bid data"}), 400

    crop = Crop.query.get(crop_id)
    if not crop:
        return jsonify({"message": "Crop not found"}), 404

    if quantity > crop.quantity:
        return jsonify({"message": "Bid quantity exceeds available stock"}), 400

    new_bid = Bid(
        crop_id=crop_id,
        buyer_id=buyer_id,
        bid_price=bid_price,
        quantity=quantity,
        status='pending'
    )
    db.session.add(new_bid)
    db.session.commit()

    return jsonify({"message": "Bid placed successfully!", "bid": new_bid.to_dict()}), 201

@bid_bp.route('/<int:id>/accept', methods=['PUT'])
def accept_bid(id):
    bid = Bid.query.get(id)
    if not bid:
        return jsonify({"message": "Bid not found"}), 404

    crop = Crop.query.get(bid.crop_id)
    if not crop:
        return jsonify({"message": "Associated crop not found"}), 404

    if bid.quantity > crop.quantity:
        return jsonify({"message": "Cannot accept bid. Stock is insufficient"}), 400

    # Accept this bid
    bid.status = 'accepted'
    
    # Deduct quantity from crop
    crop.quantity -= bid.quantity
    
    # If crop is fully sold out, reject other bids for this crop
    if crop.quantity <= 0:
        other_bids = Bid.query.filter(Bid.crop_id == bid.crop_id, Bid.id != bid.id, Bid.status == 'pending').all()
        for ob in other_bids:
            ob.status = 'rejected'

    # Record Price History for forecasting!
    from models.price_history import PriceHistory
    ph = PriceHistory(crop_name=crop.crop_name, price=bid.bid_price)
    db.session.add(ph)

    # Create shipment automatically
    from services.optimizer import calculate_distance, TRANSPORT_COST_PER_KM
    from models.farmer import Farmer
    from models.buyer import Buyer
    from models.transporter import Transporter
    from models.shipment import Shipment

    farmer = Farmer.query.get(crop.farmer_id)
    buyer = Buyer.query.get(bid.buyer_id)
    
    distance = calculate_distance(farmer.location_x, farmer.location_y, buyer.location_x, buyer.location_y) if farmer and buyer else 15.0
    transport_cost = distance * TRANSPORT_COST_PER_KM

    transporter = Transporter.query.filter_by(available=True).first()
    if transporter:
        transporter.available = False

    shipment = Shipment(
        crop_id=crop.id,
        farmer_id=crop.farmer_id,
        buyer_id=bid.buyer_id,
        transporter_id=transporter.id if transporter else None,
        status='assigned' if transporter else 'created',
        distance_km=round(distance, 2),
        transport_cost=round(transport_cost, 2),
        suggested_price=bid.bid_price
    )
    db.session.add(shipment)
    db.session.commit()

    return jsonify({"message": "Bid accepted and shipment created!", "bid": bid.to_dict()})

@bid_bp.route('/<int:id>/reject', methods=['PUT'])
def reject_bid(id):
    bid = Bid.query.get(id)
    if not bid:
        return jsonify({"message": "Bid not found"}), 404

    bid.status = 'rejected'
    db.session.commit()
    return jsonify({"message": "Bid rejected successfully!", "bid": bid.to_dict()})

@bid_bp.route('/crop/<int:crop_id>/stats', methods=['GET'])
def get_bid_stats(crop_id):
    bids = Bid.query.filter_by(crop_id=crop_id).all()
    total_bids = len(bids)
    if total_bids == 0:
        return jsonify({
            "total_bids": 0,
            "avg_bid_price": 0,
            "max_bid_price": 0,
            "min_bid_price": 0
        })

    prices = [b.bid_price for b in bids]
    return jsonify({
        "total_bids": total_bids,
        "avg_bid_price": round(sum(prices) / total_bids, 2),
        "max_bid_price": max(prices),
        "min_bid_price": min(prices)
    })
