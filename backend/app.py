from flask import Flask
from flask_cors import CORS
from config import Config
from models import db
from routes.farmer_routes import farmer_bp
from routes.crop_routes import crop_bp
from routes.buyer_routes import buyer_bp
from routes.demand_routes import demand_bp
from routes.optimize_routes import optimize_bp
from routes.bid_routes import bid_bp
from routes.auth_routes import auth_bp
from routes.upload_routes import upload_bp
from routes.transporter_routes import transporter_bp
from routes.shipment_routes import shipment_bp

app = Flask(__name__)
app.config.from_object(Config)

CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True, allow_headers=["Content-Type", "Authorization"])
db.init_app(app)

app.register_blueprint(farmer_bp, url_prefix="/api/farmers")
app.register_blueprint(crop_bp, url_prefix="/api/crops")
app.register_blueprint(buyer_bp, url_prefix="/api/buyers")
app.register_blueprint(demand_bp, url_prefix="/api/demands")
app.register_blueprint(optimize_bp, url_prefix="/api/optimize")
app.register_blueprint(bid_bp, url_prefix="/api/bids")
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(upload_bp, url_prefix="/api/upload")
app.register_blueprint(transporter_bp, url_prefix="/api/transporters")
app.register_blueprint(shipment_bp, url_prefix="/api/shipments")
from routes.chat_routes import chat_bp
app.register_blueprint(chat_bp, url_prefix="/api/chat")

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
