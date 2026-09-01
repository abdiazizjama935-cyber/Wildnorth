from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import UserSettings
from extensions import db

settings_bp = Blueprint('settings', __name__, url_prefix='/api/settings')

def get_current_user():
    user_id = int(get_jwt_identity())
    return UserSettings.query.filter_by(user_id=user_id).first()

# ─── Get user settings ──────────────────────────────────────────────
@settings_bp.route('/', methods=['GET'])
@jwt_required()
def get_settings():
    user_id = int(get_jwt_identity())
    settings = UserSettings.query.filter_by(user_id=user_id).first()
    if not settings:
        # Create default settings for the user
        settings = UserSettings(user_id=user_id)
        db.session.add(settings)
        db.session.commit()
    return jsonify({
        'theme': settings.theme,
        'font_size': settings.font_size,
        'email_notifications': settings.email_notifications,
        'push_notifications': settings.push_notifications,
        'profile_visibility': settings.profile_visibility,
    }), 200

# ─── Update user settings ──────────────────────────────────────────
@settings_bp.route('/', methods=['PUT'])
@jwt_required()
def update_settings():
    user_id = int(get_jwt_identity())
    settings = UserSettings.query.filter_by(user_id=user_id).first()
    if not settings:
        settings = UserSettings(user_id=user_id)
        db.session.add(settings)

    data = request.json
    for key in ['theme', 'font_size', 'profile_visibility']:
        if key in data:
            setattr(settings, key, data[key])
    for key in ['email_notifications', 'push_notifications']:
        if key in data:
            setattr(settings, key, data[key])

    db.session.commit()
    return jsonify({'msg': 'Settings updated'}), 200