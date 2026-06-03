from flask import Blueprint, request, jsonify

chat_bp = Blueprint("chat", __name__)

AI_ANSWERS = {
    "tomato": "Tomatoes grow best in warm weather with 6-8 hours of sunlight. Current mandi price is around ₹25-30/kg.",
    "potato": "Potatoes require well-drained, sandy loam soil. Current mandi price is stable at ₹15-18/kg.",
    "wheat": "Wheat is a rabi crop that requires temperate weather. It should be harvested when leaves turn yellow.",
    "rice": "Rice requires heavy clay soil and abundant water. Mandi price is ₹22-25/kg.",
    "market": "Markets show high demand for leafy vegetables in urban clusters. Recommending leafy greens for next rotation.",
    "optimizer": "The AgroFlow AI optimizer matches farmer crops with buyers based on transport distance, spoilage risk, and profit margin.",
    "default": "Hello! I am AgroFlow AI Assistant, your smart farming advisor. You can ask me about crop advisory, mandi prices, or optimization questions!"
}

@chat_bp.route("/", methods=["POST"])
def chat():
    data = request.json or {}
    message = data.get("message", "").lower()
    
    response = AI_ANSWERS["default"]
    for key, val in AI_ANSWERS.items():
        if key in message:
            response = val
            break
            
    return jsonify({"reply": response})
