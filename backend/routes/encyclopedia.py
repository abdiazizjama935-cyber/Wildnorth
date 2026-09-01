from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import EncyclopediaEntry, User
from extensions import db

encyclopedia_bp = Blueprint('encyclopedia', __name__, url_prefix='/api/encyclopedia')

def get_current_user():
    user_id = int(get_jwt_identity())
    return User.query.get(user_id)

# ─── GET all entries (public) ──────────────────────────────────────
@encyclopedia_bp.route('/', methods=['GET'])
def encyclopedia():
    entries = EncyclopediaEntry.query.all()
    return jsonify([{
        'id': e.id,
        'name': e.name,
        'scientific_name': e.scientific_name,
        'status': e.status,
        'habitat': e.habitat,
        'diet': e.diet,
        'size': e.size,
        'image_url': e.image_url,
        'description': e.description
    } for e in entries])

# ─── GET single entry (public) ──────────────────────────────────────
@encyclopedia_bp.route('/<int:entry_id>', methods=['GET'])
def encyclopedia_entry(entry_id):
    entry = EncyclopediaEntry.query.get(entry_id)
    if not entry:
        return jsonify({'msg': 'Not found'}), 404
    return jsonify({
        'id': entry.id,
        'name': entry.name,
        'scientific_name': entry.scientific_name,
        'status': entry.status,
        'habitat': entry.habitat,
        'diet': entry.diet,
        'size': entry.size,
        'image_url': entry.image_url,
        'description': entry.description
    })

# ─── POST new entry (admin only) ──────────────────────────────────
@encyclopedia_bp.route('/', methods=['POST'])
@jwt_required()
def create_entry():
    user = get_current_user()
    if user.role != 'admin':
        return jsonify({'msg': 'Admin only'}), 403

    data = request.json
    # Validate required fields
    if not data.get('name') or not data.get('description'):
        return jsonify({'msg': 'Name and description are required'}), 400

    entry = EncyclopediaEntry(
        name=data['name'],
        scientific_name=data.get('scientific_name'),
        status=data.get('status'),
        habitat=data.get('habitat'),
        diet=data.get('diet'),
        size=data.get('size'),
        image_url=data.get('image_url'),
        description=data['description']
    )
    db.session.add(entry)
    db.session.commit()
    return jsonify({'msg': 'Entry created', 'id': entry.id}), 201

# ─── PUT update entry (admin only) ──────────────────────────────────
@encyclopedia_bp.route('/<int:entry_id>', methods=['PUT'])
@jwt_required()
def update_entry(entry_id):
    user = get_current_user()
    if user.role != 'admin':
        return jsonify({'msg': 'Admin only'}), 403

    entry = EncyclopediaEntry.query.get(entry_id)
    if not entry:
        return jsonify({'msg': 'Not found'}), 404

    data = request.json
    # Update fields if provided
    if 'name' in data:
        entry.name = data['name']
    if 'scientific_name' in data:
        entry.scientific_name = data['scientific_name']
    if 'status' in data:
        entry.status = data['status']
    if 'habitat' in data:
        entry.habitat = data['habitat']
    if 'diet' in data:
        entry.diet = data['diet']
    if 'size' in data:
        entry.size = data['size']
    if 'image_url' in data:
        entry.image_url = data['image_url']
    if 'description' in data:
        entry.description = data['description']

    db.session.commit()
    return jsonify({'msg': 'Entry updated'}), 200

# ─── DELETE entry (admin only) ──────────────────────────────────────
@encyclopedia_bp.route('/<int:entry_id>', methods=['DELETE'])
@jwt_required()
def delete_entry(entry_id):
    user = get_current_user()
    if user.role != 'admin':
        return jsonify({'msg': 'Admin only'}), 403

    entry = EncyclopediaEntry.query.get(entry_id)
    if not entry:
        return jsonify({'msg': 'Not found'}), 404

    db.session.delete(entry)
    db.session.commit()
    return jsonify({'msg': 'Entry deleted'}), 200