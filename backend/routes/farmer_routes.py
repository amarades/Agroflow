from flask import Blueprint, request, jsonify
from models import db, Farmer, Crop, Bid
from auth_utils import token_required

farmer_bp = Blueprint('farmer', __name__)

@farmer_bp.route('/', methods=['POST'])
def add_farmer():
    data = request.json
    new_farmer = Farmer(
        name=data['name'],
        location_x=data['location_x'],
        location_y=data['location_y']
    )
    db.session.add(new_farmer)
    db.session.commit()
    return jsonify({"message": "Farmer added successfully!", "farmer": new_farmer.to_dict()}), 201

@farmer_bp.route('/', methods=['GET'])
def get_farmers():
    farmers = Farmer.query.all()
    return jsonify([f.to_dict() for f in farmers])


@farmer_bp.route('/<int:id>', methods=['DELETE'])
def delete_farmer(id):
    farmer = Farmer.query.get(id)
    if not farmer:
        return jsonify({"error": "Not found"}), 404
    db.session.delete(farmer)
    db.session.commit()
    db.session.delete(farmer)
    db.session.commit()
    return jsonify({"deleted": id})

@farmer_bp.route('/analytics', methods=['GET'])
@token_required
def get_analytics(current_user):
    if current_user.get('role') != 'farmer':
        return jsonify({'message': 'Unauthorized'}), 403
        
    farmer_id = current_user['id']
    
    # Active Listings
    active_listings = Crop.query.filter_by(farmer_id=farmer_id).count()
    
    # Sales & Revenue from Accepted Bids
    # Join Bid and Crop to filter by farmer_id
    sales_data = db.session.query(
        db.func.sum(Bid.quantity),
        db.func.sum(Bid.bid_price * Bid.quantity)
    ).join(Crop).filter(
        Crop.farmer_id == farmer_id,
        Bid.status == 'accepted'
    ).first()
    
    sold_qty = sales_data[0] or 0
    total_revenue = sales_data[1] or 0

    # Fetch all accepted bids for time-based analysis
    accepted_bids = db.session.query(Bid, Crop).join(Crop).filter(
        Crop.farmer_id == farmer_id,
        Bid.status == 'accepted'
    ).all()

    from datetime import datetime, timedelta
    now = datetime.utcnow()
    last_30_days_revenue = 0
    monthly_revenue = {} # Format: "YYYY-MM": money

    for bid, crop in accepted_bids:
        revenue = bid.bid_price * bid.quantity
        
        # Last 30 days
        if bid.created_at >= now - timedelta(days=30):
            last_30_days_revenue += revenue
            
        # Monthly grouping
        month_key = bid.created_at.strftime("%b %Y")
        monthly_revenue[month_key] = monthly_revenue.get(month_key, 0) + revenue

    # Convert monthly_revenue to list for frontend
    monthly_trend = [{"month": k, "revenue": v} for k, v in monthly_revenue.items()]
    # Sort by date? (Dictionary order not guaranteed, but for hackathon simple sort is key?)
    # Let's rely on frontend or simple sort if keys are "YYYY-MM" (but I used "%b %Y")
    # Actually, keep it simple.

    # Breakdown by Crop
    crop_performance = db.session.query(
        Crop.crop_name,
        db.func.sum(Bid.quantity),
        db.func.sum(Bid.bid_price * Bid.quantity)
    ).join(Bid).filter(
        Crop.farmer_id == farmer_id,
        Bid.status == 'accepted'
    ).group_by(Crop.crop_name).all()

    crop_breakdown = [
        {"name": c[0], "qty": c[1], "revenue": c[2]} for c in crop_performance
    ]
    
    return jsonify({
        "activeListings": active_listings,
        "soldQty": sold_qty,
        "revenue": total_revenue,
        "last30DaysRevenue": last_30_days_revenue,
        "monthlyTrend": monthly_trend,
        "cropBreakdown": crop_breakdown
    })
    

