from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Report
from extensions import db
from datetime import datetime

reports_bp = Blueprint('reports', __name__, url_prefix='/api/reports')

def get_public_user():
    """Get or create a public/guest user for unauthenticated reports."""
    public_user = User.query.filter_by(email='public@wildnorth.org').first()
    if not public_user:
        public_user = User(
            name='Public User',
            email='public@wildnorth.org',
            role='public'
        )
        public_user.set_password('public123')
        db.session.add(public_user)
        db.session.commit()
    return public_user

def get_current_user():
    """Get authenticated user, or fallback to public user if no token."""
    try:
        user_id = int(get_jwt_identity())
        return User.query.get(user_id)
    except Exception:
        return get_public_user()

@reports_bp.route('/', methods=['GET'])
@jwt_required()
def get_reports():
    user = get_current_user()
    show_all = request.args.get('all', 'false').lower() == 'true'

    if user.role == 'admin':
        reports = db.session.query(Report, User).join(User, Report.user_id == User.id).all()
        return jsonify([{
            'id': r.id,
            'incident_type': r.incident_type,
            'species': r.species,
            'location': r.location,
            'description': r.description,
            'date_time': r.date_time.isoformat(),
            'status': r.status,
            'created_at': r.created_at.isoformat(),
            'photo_url': r.photo_url,
            'user_name': u.name,
            'user_email': u.email,
        } for r, u in reports])

    if show_all:
        reports = Report.query.all()
        return jsonify([{
            'id': r.id,
            'incident_type': r.incident_type,
            'species': r.species,
            'location': r.location,
            'description': r.description,
            'date_time': r.date_time.isoformat(),
            'status': r.status,
            'created_at': r.created_at.isoformat(),
            'photo_url': r.photo_url,
        } for r in reports])

    reports = Report.query.filter_by(user_id=user.id).all()
    return jsonify([{
        'id': r.id,
        'incident_type': r.incident_type,
        'species': r.species,
        'location': r.location,
        'description': r.description,
        'date_time': r.date_time.isoformat(),
        'status': r.status,
        'created_at': r.created_at.isoformat(),
        'photo_url': r.photo_url,
    } for r in reports])

@reports_bp.route('/', methods=['POST'])
def create_report():
    data = request.json
    user = get_current_user()
    date_time_str = data['date_time'].replace('Z', '+00:00')
    date_time = datetime.fromisoformat(date_time_str)
    report = Report(
        user_id=user.id,
        incident_type=data['incident_type'],
        species=data.get('species'),
        location=data['location'],
        description=data['description'],
        date_time=date_time,
        photo_url=data.get('photo_url')
    )
    db.session.add(report)
    db.session.commit()
    return jsonify({'msg': 'Report created', 'id': report.id}), 201

@reports_bp.route('/<int:report_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def single_report(report_id):
    user = get_current_user()
    report = Report.query.get(report_id)
    if not report:
        return jsonify({'msg': 'Report not found'}), 404
    if user.role != 'admin' and report.user_id != user.id:
        return jsonify({'msg': 'Unauthorized'}), 403

    if request.method == 'GET':
        response = {
            'id': report.id,
            'incident_type': report.incident_type,
            'species': report.species,
            'location': report.location,
            'description': report.description,
            'date_time': report.date_time.isoformat(),
            'status': report.status,
            'photo_url': report.photo_url,
            'created_at': report.created_at.isoformat()
        }
        if user.role == 'admin':
            reporter = User.query.get(report.user_id)
            if reporter:
                response['user_name'] = reporter.name
                response['user_email'] = reporter.email
        return jsonify(response), 200

    if request.method == 'PUT':
        data = request.json
        report.incident_type = data.get('incident_type', report.incident_type)
        report.species = data.get('species', report.species)
        report.location = data.get('location', report.location)
        report.description = data.get('description', report.description)
        report.status = data.get('status', report.status)
        report.photo_url = data.get('photo_url', report.photo_url)
        db.session.commit()
        return jsonify({'msg': 'Report updated'}), 200

    if request.method == 'DELETE':
        db.session.delete(report)
        db.session.commit()
        return jsonify({'msg': 'Report deleted'}), 200