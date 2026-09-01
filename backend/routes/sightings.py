from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Sighting
from extensions import db
from datetime import datetime

sightings_bp = Blueprint('sightings', __name__, url_prefix='/api/sightings')

def get_current_user():
    user_id = int(get_jwt_identity())
    return User.query.get(user_id)

# ─── Helper: parse ISO date with 'Z' ──────────────────────────
def parse_date(date_str):
    # Replace 'Z' with '+00:00' for Python's fromisoformat
    return datetime.fromisoformat(date_str.replace('Z', '+00:00'))

# ─── GET all sightings (admin sees all, user sees own) ──────────
@sightings_bp.route('/', methods=['GET'])
@jwt_required()
def get_sightings():
    user = get_current_user()
    if user.role == 'admin':
        sightings = Sighting.query.all()
    else:
        sightings = Sighting.query.filter_by(user_id=user.id).all()
    return jsonify([{
        'id': s.id,
        'species': s.species,
        'location': s.location,
        'count': s.count,
        'behaviour': s.behaviour,
        'notes': s.notes,
        'date_time': s.date_time.isoformat(),
        'image_url': s.image_url
    } for s in sightings])

# ─── POST new sighting ──────────────────────────────────────────
@sightings_bp.route('/', methods=['POST'])
@jwt_required()
def create_sighting():
    user = get_current_user()
    data = request.json
    sighting = Sighting(
        user_id=user.id,
        species=data['species'],
        location=data['location'],
        count=data.get('count'),
        behaviour=data.get('behaviour'),
        notes=data.get('notes'),
        date_time=parse_date(data['date_time']),
        image_url=data.get('image_url')
    )
    db.session.add(sighting)
    db.session.commit()
    return jsonify({'msg': 'Sighting created', 'id': sighting.id}), 201

# ─── GET single sighting ──────────────────────────────────────────
@sightings_bp.route('/<int:sighting_id>', methods=['GET'])
@jwt_required()
def get_sighting(sighting_id):
    user = get_current_user()
    sighting = Sighting.query.get(sighting_id)
    if not sighting:
        return jsonify({'msg': 'Not found'}), 404
    if user.role != 'admin' and sighting.user_id != user.id:
        return jsonify({'msg': 'Unauthorized'}), 403
    return jsonify({
        'id': sighting.id,
        'species': sighting.species,
        'location': sighting.location,
        'count': sighting.count,
        'behaviour': sighting.behaviour,
        'notes': sighting.notes,
        'date_time': sighting.date_time.isoformat(),
        'image_url': sighting.image_url
    })

# ─── PUT update sighting ──────────────────────────────────────────
@sightings_bp.route('/<int:sighting_id>', methods=['PUT'])
@jwt_required()
def update_sighting(sighting_id):
    user = get_current_user()
    sighting = Sighting.query.get(sighting_id)
    if not sighting:
        return jsonify({'msg': 'Not found'}), 404
    if user.role != 'admin' and sighting.user_id != user.id:
        return jsonify({'msg': 'Unauthorized'}), 403

    data = request.json
    # Update only provided fields
    if 'species' in data:
        sighting.species = data['species']
    if 'location' in data:
        sighting.location = data['location']
    if 'count' in data:
        sighting.count = data['count']
    if 'behaviour' in data:
        sighting.behaviour = data['behaviour']
    if 'notes' in data:
        sighting.notes = data['notes']
    if 'date_time' in data:
        sighting.date_time = parse_date(data['date_time'])
    if 'image_url' in data:
        sighting.image_url = data['image_url']

    db.session.commit()
    return jsonify({'msg': 'Sighting updated'}), 200

# ─── DELETE sighting ──────────────────────────────────────────────
@sightings_bp.route('/<int:sighting_id>', methods=['DELETE'])
@jwt_required()
def delete_sighting(sighting_id):
    user = get_current_user()
    sighting = Sighting.query.get(sighting_id)
    if not sighting:
        return jsonify({'msg': 'Not found'}), 404
    if user.role != 'admin' and sighting.user_id != user.id:
        return jsonify({'msg': 'Unauthorized'}), 403

    db.session.delete(sighting)
    db.session.commit()
    return jsonify({'msg': 'Sighting deleted'}), 200