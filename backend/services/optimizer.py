import math
from datetime import datetime
from models import db, Crop, Buyer, Demand, Farmer, Transporter, Shipment

# Economics
TRANSPORT_COST_PER_KM = 2
COMMISSION_RATE = 0.05  # 5% platform commission
MIN_PROFIT_MARGIN = 0.10  # ensure farmer gets at least 10% above base price per kg


def calculate_distance(x1, y1, x2, y2):
    """Haversine-style distance (tolerant to lat/lon-like coords).
    Treats stored location_x/location_y as latitude/longitude in degrees when
    values look like coordinates; otherwise falls back to Euclidean distance.
    """
    try:
        # assume degrees -> use haversine
        r = 6371.0  # Earth radius km
        lat1 = math.radians(float(x1))
        lon1 = math.radians(float(y1))
        lat2 = math.radians(float(x2))
        lon2 = math.radians(float(y2))

        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return r * c
    except Exception:
        # fallback
        return math.sqrt((float(x2) - float(x1)) ** 2 + (float(y2) - float(y1)) ** 2)


def demand_priority(required_quantity):
    return required_quantity * 0.1


def spoilage_penalty(expiry_days):
    if expiry_days <= 1:
        return 15
    elif expiry_days <= 3:
        return 5
    return 0


def dynamic_price_factor(crop_name):
    """Calculate dynamic price adjustment based on supply/demand ratio"""
    total_supply = db.session.query(db.func.sum(Crop.quantity)).filter_by(crop_name=crop_name).scalar() or 0
    total_demand = db.session.query(db.func.sum(Demand.required_quantity)).filter_by(crop_name=crop_name).scalar() or 0
    if total_demand > total_supply:
        return 1.15  # 15% price increase for high demand
    elif total_supply > total_demand * 1.5:
        return 0.90  # 10% price decrease for oversupply
    return 1.0


def find_best_match(crop):
    """Find the best buyer match for a crop with partial fulfillment support"""
    farmer = Farmer.query.get(crop.farmer_id)
    if not farmer:
        return None

    demands = Demand.query.filter_by(crop_name=crop.crop_name).all()
    if not demands:
        return None

    best_result = None
    highest_score = -9999
    price_factor = dynamic_price_factor(crop.crop_name)

    for demand in demands:
        buyer = Buyer.query.get(demand.buyer_id)
        if not buyer:
            continue

        # Allow partial fulfillment - match even if demand > supply
        matched_qty = min(crop.quantity, demand.required_quantity)

        distance = calculate_distance(
            farmer.location_x, farmer.location_y,
            buyer.location_x, buyer.location_y,
        )
        transport_cost = distance * TRANSPORT_COST_PER_KM
        margin = demand.max_price - crop.base_price
        fulfillment_ratio = matched_qty / demand.required_quantity

        # Enhanced scoring with fulfillment bonus
        score = (
            margin
            - transport_cost
            + demand_priority(matched_qty)
            - spoilage_penalty(crop.expiry_days)
            + (fulfillment_ratio * 5)  # bonus for higher fulfillment
        )

        if score > highest_score:
            highest_score = score
            suggested_price = round((crop.base_price + margin * 0.6) * price_factor, 2)
            profit = round(suggested_price * matched_qty - transport_cost, 2)
            waste_saved_pct = round(matched_qty / crop.quantity * 100, 1)

            # Commission & minimum guarantee calculations
            commission_per_kg = round(suggested_price * COMMISSION_RATE, 2)
            farmer_receive_per_kg = round(suggested_price - commission_per_kg, 2)
            farmer_expected_total = round(farmer_receive_per_kg * matched_qty, 2)
            platform_fee_total = round(commission_per_kg * matched_qty, 2)

            # Ensure a minimum guaranteed price (per-kg) for farmer
            guaranteed_price_per_kg = max(suggested_price, round(crop.base_price * (1 + MIN_PROFIT_MARGIN), 2))

            best_result = {
                "buyer_name": buyer.name,
                "buyer_id": buyer.id,
                "buyer_location": {"x": buyer.location_x, "y": buyer.location_y} if hasattr(buyer, 'location_x') else None,
                "distance": round(distance, 2),
                "transport_cost": round(transport_cost, 2),
                "suggested_price": suggested_price,
                "commission_per_kg": commission_per_kg,
                "farmer_receive_per_kg": farmer_receive_per_kg,
                "farmer_expected_total": farmer_expected_total,
                "platform_fee_total": platform_fee_total,
                "guaranteed_price_per_kg": guaranteed_price_per_kg,
                "score": round(score, 2),
                "estimated_profit": profit,
                "price_factor": price_factor,
                "matched_qty": matched_qty,
                "demanded_qty": demand.required_quantity,
                "fulfillment_pct": round(fulfillment_ratio * 100, 1),
                "waste_saved_pct": waste_saved_pct,
                "farmer_base_price": crop.base_price,
                "buyer_max_price": demand.max_price,
                "farmer_location": {"x": farmer.location_x, "y": farmer.location_y} if hasattr(farmer, 'location_x') else None,
                "price_margin": round(margin, 2),
                "spoilage_urgency": "HIGH" if crop.expiry_days <= 1 else "MEDIUM" if crop.expiry_days <= 3 else "LOW",
            }

    return best_result


def optimize_all():
    """Run optimization for all crops, prioritizing those near expiry"""
    crops = Crop.query.order_by(Crop.expiry_days.asc()).all()
    results = []
    for crop in crops:
        match = find_best_match(crop)
        if match:
            match["crop_name"] = crop.crop_name
            match["crop_id"] = crop.id
            match["farmer_id"] = crop.farmer_id
            match["expiry_days"] = crop.expiry_days
            match["available_qty"] = crop.quantity
            farmer = Farmer.query.get(crop.farmer_id)
            match["farmer_name"] = farmer.name if farmer else "Unknown"
            results.append(match)
    return results


def create_shipment_for_match(match):
    """Create a Shipment record from a match dict. Assign nearest available transporter if present."""
    if not match:
        return None

    crop = Crop.query.get(match.get('crop_id'))
    if not crop:
        return None

    # Find nearest available transporter using farmer's stored location
    transporters = Transporter.query.filter_by(available=True).all()
    assigned_transporter = None
    farmer = Farmer.query.get(crop.farmer_id)
    if transporters and farmer:
        best = None
        best_d = None
        for t in transporters:
            d = calculate_distance(t.location_x, t.location_y, farmer.location_x, farmer.location_y)
            if best_d is None or d < best_d:
                best_d = d
                best = t
        assigned_transporter = best

    shipment = Shipment(
        crop_id=crop.id,
        farmer_id=crop.farmer_id,
        buyer_id=match.get('buyer_id'),
        transporter_id=assigned_transporter.id if assigned_transporter else None,
        status='assigned' if assigned_transporter else 'created',
        distance_km=match.get('distance'),
        transport_cost=match.get('transport_cost'),
        suggested_price=match.get('suggested_price')
    )

    if assigned_transporter:
        assigned_transporter.available = False

    db.session.add(shipment)
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return None

    return shipment.to_dict()


def simulate_forecast(crop_name, months=12):
    """Simple rule-based forecasting prototype. Returns monthly price and demand estimates."""
    crops = Crop.query.filter_by(crop_name=crop_name).all()
    demands = Demand.query.filter_by(crop_name=crop_name).all()

    avg_base = round(sum(c.base_price for c in crops) / len(crops), 2) if crops else 100.0
    total_demand = sum(d.required_quantity for d in demands) if demands else 0

    results = []
    for m in range(months):
        # seasonal factor: simple sine wave
        seasonal = 0.05 * math.sin(2 * math.pi * (m / 12))
        price = round(avg_base * (1 + seasonal) * dynamic_price_factor(crop_name), 2)
        # demand estimate: distributed total demand + seasonal
        demand_est = int(max(0, (total_demand / max(1, months)) * (1 + seasonal)))
        results.append({"month": m + 1, "predicted_price": price, "predicted_demand": demand_est})

    return {"crop_name": crop_name, "avg_base": avg_base, "forecast": results, "generated_at": datetime.utcnow().isoformat()}


def get_platform_analytics():
    """Generate comprehensive analytics for the platform"""
    crops = Crop.query.all()
    demands = Demand.query.all()
    farmers = Farmer.query.all()
    buyers = Buyer.query.all()

    # Supply vs demand by crop
    supply_map = {}
    for c in crops:
        supply_map[c.crop_name] = supply_map.get(c.crop_name, 0) + c.quantity
    demand_map = {}
    for d in demands:
        demand_map[d.crop_name] = demand_map.get(d.crop_name, 0) + d.required_quantity

    all_crop_names = set(list(supply_map.keys()) + list(demand_map.keys()))
    supply_demand = []
    for name in sorted(all_crop_names):
        s = supply_map.get(name, 0)
        d = demand_map.get(name, 0)
        supply_demand.append({
            "crop": name,
            "supply": s,
            "demand": d,
            "balance": s - d,
            "status": "Surplus" if s > d else "Shortage" if d > s else "Balanced",
            "price_factor": dynamic_price_factor(name),
        })

    # Waste risk
    at_risk = [c for c in crops if c.expiry_days <= 3]
    total_at_risk_qty = sum(c.quantity for c in at_risk)
    total_supply_qty = sum(c.quantity for c in crops)

    # Run optimization to get profit stats
    opt_results = optimize_all()
    total_profit = sum(r["estimated_profit"] for r in opt_results)
    total_matched_qty = sum(r["matched_qty"] for r in opt_results)
    avg_score = round(sum(r["score"] for r in opt_results) / len(opt_results), 2) if opt_results else 0

    return {
        "summary": {
            "total_farmers": len(farmers),
            "total_buyers": len(buyers),
            "total_crops": len(crops),
            "total_demands": len(demands),
            "total_supply_qty": total_supply_qty,
            "total_demand_qty": sum(d.required_quantity for d in demands),
            "total_matches": len(opt_results),
            "total_estimated_profit": round(total_profit, 2),
            "total_matched_qty": total_matched_qty,
            "avg_match_score": avg_score,
            "waste_risk_qty": total_at_risk_qty,
            "waste_risk_pct": round(total_at_risk_qty / total_supply_qty * 100, 1) if total_supply_qty > 0 else 0,
        },
        "supply_demand": supply_demand,
        "waste_risk_crops": [
            {
                "id": c.id,
                "crop_name": c.crop_name,
                "quantity": c.quantity,
                "expiry_days": c.expiry_days,
                "farmer_id": c.farmer_id,
                "urgency": "CRITICAL" if c.expiry_days <= 1 else "WARNING",
            }
            for c in at_risk
        ],
    }
    
