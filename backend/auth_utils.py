import jwt
from flask import request, jsonify, current_app
from functools import wraps
from models import Farmer, Buyer

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            # Decode token
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            role = data.get('role')
            user_id = data.get('id')
            
            if role == 'farmer':
                user = Farmer.query.get(user_id)
            elif role == 'buyer':
                user = Buyer.query.get(user_id)
            else:
                return jsonify({'message': 'Invalid role!'}), 401
                
            if not user:
                return jsonify({'message': 'User not found!'}), 401
                
            current_user = {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': role,
                'location_x': user.location_x,
                'location_y': user.location_y
            }
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token!'}), 401
            
        return f(current_user, *args, **kwargs)
        
    return decorated
