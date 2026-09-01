from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Conversation, Message
from extensions import db
from datetime import datetime

messages_bp = Blueprint('messages', __name__, url_prefix='/api/messages')

def get_current_user():
    user_id = int(get_jwt_identity())
    return User.query.get(user_id)

# ─── List all conversations for the logged‑in user ──────────────
@messages_bp.route('/conversations', methods=['GET'])
@jwt_required()
def get_conversations():
    user = get_current_user()
    # Find conversations where the user is a participant (contains user.id)
    conversations = Conversation.query.filter(
        Conversation.participants.contains(str(user.id))
    ).order_by(Conversation.last_message_time.desc()).all()

    result = []
    for conv in conversations:
        # Parse participants string (comma-separated)
        ids = [int(i) for i in conv.participants.split(',')]
        other_id = next((id for id in ids if id != user.id), None)
        other_user = User.query.get(other_id) if other_id else None
        unread = Message.query.filter_by(
            conversation_id=conv.id,
            read=False
        ).filter(Message.sender_id != user.id).count()

        result.append({
            'id': conv.id,
            'name': other_user.name if other_user else 'Unknown',
            'avatar': other_user.name[0] if other_user else '?',
            'lastMessage': conv.last_message or '',
            'time': conv.last_message_time.isoformat(),
            'unread': unread,
            'online': False,
        })
    return jsonify(result)

# ─── Get messages for a specific conversation ────────────────────
@messages_bp.route('/<int:conv_id>', methods=['GET'])
@jwt_required()
def get_messages(conv_id):
    user = get_current_user()
    conv = Conversation.query.get(conv_id)
    if not conv:
        return jsonify({'msg': 'Conversation not found'}), 404
    if str(user.id) not in conv.participants.split(','):
        return jsonify({'msg': 'Unauthorized'}), 403

    messages = Message.query.filter_by(conversation_id=conv_id).order_by(Message.created_at).all()
    # Mark as read (except user's own messages)
    for msg in messages:
        if msg.sender_id != user.id and not msg.read:
            msg.read = True
    db.session.commit()

    return jsonify([{
        'id': m.id,
        'sender_id': m.sender_id,
        'content': m.content,
        'created_at': m.created_at.isoformat(),
        'read': m.read,
    } for m in messages])

# ─── Send a new message ──────────────────────────────────────────
@messages_bp.route('/<int:conv_id>/send', methods=['POST'])
@jwt_required()
def send_message(conv_id):
    user = get_current_user()
    data = request.json
    content = data.get('content')
    if not content:
        return jsonify({'msg': 'Message content is required'}), 400

    conv = Conversation.query.get(conv_id)
    if not conv:
        return jsonify({'msg': 'Conversation not found'}), 404
    if str(user.id) not in conv.participants.split(','):
        return jsonify({'msg': 'Unauthorized'}), 403

    msg = Message(conversation_id=conv_id, sender_id=user.id, content=content)
    conv.last_message = content
    conv.last_message_time = datetime.utcnow()
    db.session.add(msg)
    db.session.commit()

    return jsonify({'msg': 'Message sent', 'id': msg.id}), 201

# ─── Start a new conversation (or return existing) ──────────────
@messages_bp.route('/start', methods=['POST'])
@jwt_required()
def start_conversation():
    user = get_current_user()
    data = request.json
    other_user_id = data.get('user_id')
    if not other_user_id:
        return jsonify({'msg': 'User ID required'}), 400

    other_user = User.query.get(other_user_id)
    if not other_user:
        return jsonify({'msg': 'User not found'}), 404

    # Check if conversation already exists between these two users
    # We look for conversations where participants contains both IDs
    existing = Conversation.query.filter(
        Conversation.participants.contains(str(user.id))
    ).filter(
        Conversation.participants.contains(str(other_user_id))
    ).first()
    if existing:
        return jsonify({'id': existing.id}), 200

    # Create new conversation
    participants = f"{user.id},{other_user_id}"
    conv = Conversation(participants=participants)
    db.session.add(conv)
    db.session.commit()

    # Optionally add a welcome message from the admin? No, we leave it empty.

    return jsonify({'id': conv.id}), 201