from flask import Blueprint, request, jsonify
from models import Crop
from services.optimizer import find_best_match, optimize_all, simulate_forecast, get_platform_analytics
import os
import pickle
from flask import current_app

MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'scripts', 'forecast_models')
os.makedirs(MODEL_DIR, exist_ok=True)

optimize_bp = Blueprint("optimize", __name__)

@optimize_bp.route("/", methods=["POST"])
def optimize():
    data = request.json
    crop_id = data.get("crop_id")

    crop = Crop.query.get(crop_id)

    if not crop:
        return jsonify({"error": "Crop not found"}), 404

    result = find_best_match(crop)
    
    if not result:
        return jsonify({"error": "No suitable buyer found matching the criteria."}), 404

    return jsonify(result)


@optimize_bp.route("/all", methods=["GET"])
def optimize_all_crops():
    results = optimize_all()
    return jsonify(results)


@optimize_bp.route("/analytics", methods=["GET"])
def analytics():
    data = get_platform_analytics()
    return jsonify(data)


@optimize_bp.route('/forecast/<crop_name>', methods=['GET'])
def forecast(crop_name):
    # If a trained model exists, load and predict; otherwise use simulate_forecast
    model_path = os.path.join(MODEL_DIR, f"{crop_name.replace(' ', '_')}.pkl")
    months = int(request.args.get('months', 12))
    if os.path.exists(model_path):
        try:
            with open(model_path, 'rb') as f:
                model = pickle.load(f)
            preds = []
            # create index features
            for m in range(months):
                x = [[m]]
                price = float(model.predict(x)[0])
                preds.append({"month": m + 1, "predicted_price": round(price, 2), "predicted_demand": None})
            return jsonify({"crop_name": crop_name, "forecast": preds, "generated_at": None})
        except Exception:
            pass

    data = simulate_forecast(crop_name, months=months)
    return jsonify(data)


@optimize_bp.route('/train_forecast', methods=['POST'])
def train_forecast():
    # Trigger training script to build simple linear models from PriceHistory
    try:
        from scripts.train_forecast import train_models

        trained = train_models()
        return jsonify({"trained": trained})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
