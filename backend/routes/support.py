from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, SupportTicket, TicketReply
from extensions import db

support_bp = Blueprint('support', __name__, url_prefix='/api/support')

def get_current_user():
    user_id = int(get_jwt_identity())
    return User.query.get(user_id)

# ─── List all tickets (admin sees all, user sees own) ──────────
@support_bp.route('/tickets', methods=['GET'])
@jwt_required()
def get_tickets():
    user = get_current_user()
    query = SupportTicket.query
    if user.role != 'admin':
        query = query.filter_by(user_id=user.id)
    tickets = query.order_by(SupportTicket.created_at.desc()).all()
    return jsonify([{
        'id': t.id,
        'subject': t.subject,
        'message': t.message,
        'status': t.status,
        'priority': t.priority,
        'created_at': t.created_at.isoformat(),
        'updated_at': t.updated_at.isoformat(),
        'user_id': t.user_id,
        'user_name': t.user.name,
        'user_email': t.user.email,
    } for t in tickets])

# ─── Get single ticket with replies ──────────────────────────────
@support_bp.route('/tickets/<int:ticket_id>', methods=['GET'])
@jwt_required()
def get_ticket(ticket_id):
    user = get_current_user()
    ticket = SupportTicket.query.get(ticket_id)
    if not ticket:
        return jsonify({'msg': 'Ticket not found'}), 404
    if user.role != 'admin' and ticket.user_id != user.id:
        return jsonify({'msg': 'Unauthorized'}), 403
    replies = TicketReply.query.filter_by(ticket_id=ticket.id).order_by(TicketReply.created_at).all()
    return jsonify({
        'id': ticket.id,
        'subject': ticket.subject,
        'message': ticket.message,
        'status': ticket.status,
        'priority': ticket.priority,
        'created_at': ticket.created_at.isoformat(),
        'updated_at': ticket.updated_at.isoformat(),
        'user_id': ticket.user_id,
        'user_name': ticket.user.name,
        'user_email': ticket.user.email,
        'replies': [{
            'id': r.id,
            'user_id': r.user_id,
            'user_name': r.user.name,
            'message': r.message,
            'created_at': r.created_at.isoformat(),
        } for r in replies]
    })

# ─── Create a new ticket ───────────────────────────────────────────
@support_bp.route('/tickets', methods=['POST'])
@jwt_required()
def create_ticket():
    user = get_current_user()
    data = request.json
    subject = data.get('subject')
    message = data.get('message')
    priority = data.get('priority', 'medium')
    if not subject or not message:
        return jsonify({'msg': 'Subject and message are required'}), 400
    ticket = SupportTicket(
        user_id=user.id,
        subject=subject,
        message=message,
        priority=priority
    )
    db.session.add(ticket)
    db.session.commit()
    return jsonify({'msg': 'Ticket created', 'id': ticket.id}), 201

# ─── Update ticket status ──────────────────────────────────────────
@support_bp.route('/tickets/<int:ticket_id>', methods=['PUT'])
@jwt_required()
def update_ticket(ticket_id):
    user = get_current_user()
    ticket = SupportTicket.query.get(ticket_id)
    if not ticket:
        return jsonify({'msg': 'Ticket not found'}), 404
    if user.role != 'admin' and ticket.user_id != user.id:
        return jsonify({'msg': 'Unauthorized'}), 403
    data = request.json
    if 'status' in data:
        ticket.status = data['status']
    if 'priority' in data:
        ticket.priority = data['priority']
    db.session.commit()
    return jsonify({'msg': 'Ticket updated'})

# ─── Close ticket ──────────────────────────────────────────────────
@support_bp.route('/tickets/<int:ticket_id>/close', methods=['POST'])
@jwt_required()
def close_ticket(ticket_id):
    user = get_current_user()
    ticket = SupportTicket.query.get(ticket_id)
    if not ticket:
        return jsonify({'msg': 'Ticket not found'}), 404
    if user.role != 'admin' and ticket.user_id != user.id:
        return jsonify({'msg': 'Unauthorized'}), 403
    ticket.status = 'closed'
    db.session.commit()
    return jsonify({'msg': 'Ticket closed'})

# ─── Reply to ticket ──────────────────────────────────────────────
@support_bp.route('/tickets/<int:ticket_id>/reply', methods=['POST'])
@jwt_required()
def reply_ticket(ticket_id):
    user = get_current_user()
    ticket = SupportTicket.query.get(ticket_id)
    if not ticket:
        return jsonify({'msg': 'Ticket not found'}), 404
    # Allow both admin and the ticket owner to reply
    if user.role != 'admin' and ticket.user_id != user.id:
        return jsonify({'msg': 'Unauthorized'}), 403
    data = request.json
    message = data.get('message')
    if not message:
        return jsonify({'msg': 'Reply message is required'}), 400
    reply = TicketReply(
        ticket_id=ticket.id,
        user_id=user.id,
        message=message
    )
    db.session.add(reply)
    # If the ticket was closed, re-open it when admin replies
    if ticket.status == 'closed':
        ticket.status = 'open'
    db.session.commit()
    return jsonify({'msg': 'Reply added', 'id': reply.id}), 201