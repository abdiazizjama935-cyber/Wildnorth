from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

notifications_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')

@notifications_bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    # user_id = int(get_jwt_identity())  # optionally use it
    return jsonify([])