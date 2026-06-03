import jwt
import datetime
import bcrypt
from flask import Blueprint, request, jsonify, current_app
from models import db, Farmer, Buyer
from auth_utils import token_required

auth_bp = Blueprint('auth', __name__)

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def check_password(password, hashed):
    if not hashed:
        return False
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json or {}
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    role = data.get('role', 'farmer') # 'farmer' or 'buyer'
    location_x = float(data.get('location_x', 0))
    location_y = float(data.get('location_y', 0))

    if not email or not password or not name:
        return jsonify({"message": "Missing required fields"}), 400

    # Check if user already exists
    if role == 'farmer':
        if Farmer.query.filter_by(email=email).first():
            return jsonify({"message": "Email already exists"}), 400
        new_user = Farmer(
            name=name,
            email=email,
            password_hash=hash_password(password),
            location_x=location_x,
            location_y=location_y
        )
    elif role == 'buyer':
        if Buyer.query.filter_by(email=email).first():
            return jsonify({"message": "Email already exists"}), 400
        new_user = Buyer(
            name=name,
            email=email,
            password_hash=hash_password(password),
            location_x=location_x,
            location_y=location_y
        )
    else:
        return jsonify({"message": "Invalid role"}), 400

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": f"{role.capitalize()} registered successfully!"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json or {}
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'farmer')

    if not email or not password:
        return jsonify({"message": "Missing email or password"}), 400

    user = None
    if role == 'farmer':
        user = Farmer.query.filter_by(email=email).first()
    elif role == 'buyer':
        user = Buyer.query.filter_by(email=email).first()

    if not user or not check_password(password, user.password_hash):
        return jsonify({"message": "Invalid email or password"}), 401

    # Issue JWT token
    token = jwt.encode({
        'id': user.id,
        'email': user.email,
        'role': role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, current_app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({
        "token": token,
        "role": role,
        "user": user.to_dict()
    }), 200

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_me(current_user):
    return jsonify({
        "user": {
            "id": current_user['id'],
            "name": current_user['name'],
            "email": current_user['email']
        },
        "role": current_user['role']
    })
