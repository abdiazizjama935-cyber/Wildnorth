from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Report, Sighting, EncyclopediaEntry, Conversation, SupportTicket, Message
from extensions import db
from datetime import datetime  # <-- ADD THIS

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

def get_current_user():
    user_id = int(get_jwt_identity())
    return User.query.get(user_id)

# ─── Helper: ensure admin role ──────────────────────────────────
def require_admin():
    user = get_current_user()
    if not user or user.role != 'admin':
        return None
    return user

# ─── Stats endpoint ──────────────────────────────────────────────
@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    admin = require_admin()
    if not admin:
        return jsonify({'msg': 'Admin only'}), 403

    stats = {
        'users': User.query.count(),
        'reports': Report.query.count(),
        'sightings': Sighting.query.count(),
        'encyclopedia': EncyclopediaEntry.query.count(),
        'conversations': Conversation.query.count(),
        'support_tickets': SupportTicket.query.count(),
    }
    return jsonify(stats), 200

# ─── List all users ──────────────────────────────────────────────
@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def list_users():
    admin = require_admin()
    if not admin:
        return jsonify({'msg': 'Admin only'}), 403

    users = User.query.all()
    return jsonify([{
        'id': u.id,
        'name': u.name,
        'email': u.email,
        'role': u.role,
        'created_at': u.created_at.isoformat()
    } for u in users]), 200

# ─── Update a user ──────────────────────────────────────────────
@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    admin = require_admin()
    if not admin:
        return jsonify({'msg': 'Admin only'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'msg': 'User not found'}), 404

    data = request.json
    if 'name' in data:
        user.name = data['name']
    if 'role' in data:
        if data['role'] not in ['user', 'admin']:
            return jsonify({'msg': 'Invalid role'}), 400
        user.role = data['role']

    db.session.commit()
    return jsonify({
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'role': user.role,
        'created_at': user.created_at.isoformat()
    }), 200

# ─── Delete a user ──────────────────────────────────────────────
@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    admin = require_admin()
    if not admin:
        return jsonify({'msg': 'Admin only'}), 403

    # Prevent admin from deleting themselves
    if user_id == admin.id:
        return jsonify({'msg': 'Cannot delete your own account'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'msg': 'User not found'}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({'msg': 'User deleted'}), 200

# ─── Admin view all conversations ──────────────────────────────
@admin_bp.route('/conversations', methods=['GET'])
@jwt_required()
def admin_get_conversations():
    admin = require_admin()
    if not admin:
        return jsonify({'msg': 'Admin only'}), 403

    conversations = Conversation.query.order_by(Conversation.last_message_time.desc()).all()
    result = []
    for conv in conversations:
        ids = [int(i) for i in conv.participants.split(',')]
        users = User.query.filter(User.id.in_(ids)).all()
        participants = [{'id': u.id, 'name': u.name, 'email': u.email} for u in users]
        # Get last message sender
        last_message_obj = Message.query.filter_by(conversation_id=conv.id).order_by(Message.created_at.desc()).first()
        last_sender = User.query.get(last_message_obj.sender_id) if last_message_obj else None
        unread = Message.query.filter_by(conversation_id=conv.id, read=False).count()

        result.append({
            'id': conv.id,
            'participants': participants,
            'participant_ids': ids,
            'lastMessage': conv.last_message or '',
            'lastSender': last_sender.name if last_sender else None,
            'time': conv.last_message_time.isoformat() if conv.last_message_time else None,
            'unread': unread,
        })
    return jsonify(result), 200

# ─── Admin get messages for a conversation (even if not participant) ──
@admin_bp.route('/conversations/<int:conv_id>/messages', methods=['GET'])
@jwt_required()
def admin_get_conversation_messages(conv_id):
    admin = require_admin()
    if not admin:
        return jsonify({'msg': 'Admin only'}), 403

    conv = Conversation.query.get(conv_id)
    if not conv:
        return jsonify({'msg': 'Conversation not found'}), 404

    messages = Message.query.filter_by(conversation_id=conv_id).order_by(Message.created_at).all()
    return jsonify([{
        'id': m.id,
        'sender_id': m.sender_id,
        'sender_name': User.query.get(m.sender_id).name if User.query.get(m.sender_id) else 'Unknown',
        'content': m.content,
        'created_at': m.created_at.isoformat(),
        'read': m.read,
    } for m in messages]), 200

# ─── Admin send a message to a conversation ──────────────────────────
@admin_bp.route('/conversations/<int:conv_id>/send', methods=['POST'])
@jwt_required()
def admin_send_message(conv_id):
    admin = require_admin()
    if not admin:
        return jsonify({'msg': 'Admin only'}), 403

    conv = Conversation.query.get(conv_id)
    if not conv:
        return jsonify({'msg': 'Conversation not found'}), 404

    data = request.json
    content = data.get('content')
    if not content:
        return jsonify({'msg': 'Message content is required'}), 400

    msg = Message(
        conversation_id=conv_id,
        sender_id=admin.id,
        content=content
    )
    conv.last_message = content
    conv.last_message_time = datetime.utcnow()   # datetime is now imported
    db.session.add(msg)
    db.session.commit()

    return jsonify({'msg': 'Message sent', 'id': msg.id}), 201