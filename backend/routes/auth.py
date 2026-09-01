from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User
from extensions import db

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

def get_current_user():
    user_id = int(get_jwt_identity())   # ✅ FIX: convert to int
    return User.query.get(user_id)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'msg': 'Email and password are required'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'msg': 'Email already exists'}), 400

    name = data.get('name') or data.get('fullName') or data.get('full_name') or 'User'
    role = data.get('role', 'user')

    user = User(name=name, email=email, role=role)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = user.generate_token()
    return jsonify({
        'access_token': token,
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role
        }
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'msg': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'msg': 'Invalid credentials'}), 401

    token = user.generate_token()
    return jsonify({
        'access_token': token,
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role
        }
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user = get_current_user()
    if not user:
        return jsonify({'msg': 'User not found'}), 404
    return jsonify({
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'role': user.role,
        'created_at': user.created_at.isoformat()
    }), 200

# ─── NEW: Public endpoint to get admin user ID ──────────────────
@auth_bp.route('/admin-id', methods=['GET'])
def get_admin_id():
    """
    Returns the ID of the admin user (hardcoded email: admin@wildnorth.org).
    Used by the frontend to start a conversation with admin.
    """
    admin = User.query.filter_by(email='admin@wildnorth.org').first()
    if admin:
        return jsonify({'id': admin.id}), 200
    return jsonify({'error': 'Admin user not found'}), 404
from datetime import datetime
from flask import request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os

@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'msg': 'User not found'}), 404

    # Text fields
    name = request.form.get('name')
    email = request.form.get('email')
    phone = request.form.get('phone')
    location = request.form.get('location')
    bio = request.form.get('bio')

    if name:
        user.name = name
    if email:
        existing = User.query.filter(User.email == email, User.id != user.id).first()
        if existing:
            return jsonify({'msg': 'Email already in use'}), 400
        user.email = email
    if phone is not None:
        user.phone = phone
    if location is not None:
        user.location = location
    if bio is not None:
        user.bio = bio

    # Avatar upload
    if 'avatar' in request.files:
        file = request.files['avatar']
        if file and file.filename:
            # Secure filename
            filename = secure_filename(file.filename)
            ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'jpg'
            new_filename = f"avatar_{user.id}_{int(datetime.utcnow().timestamp())}.{ext}"
            
            upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'avatars')
            os.makedirs(upload_dir, exist_ok=True)
            file_path = os.path.join(upload_dir, new_filename)
            file.save(file_path)
            
            # Store relative URL (adjust if needed)
            user.avatar_url = f"/uploads/avatars/{new_filename}"

    db.session.commit()
    
    return jsonify({
        'msg': 'Profile updated',
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'phone': user.phone,
            'location': user.location,
            'bio': user.bio,
            'avatar_url': user.avatar_url,
            'role': user.role,
            'created_at': user.created_at.isoformat()
        }
    }), 200