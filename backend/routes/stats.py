from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Report, Sighting
from datetime import datetime

stats_bp = Blueprint('stats', __name__, url_prefix='/api/stats')

# ─── Public global stats (for admin overview) ──────────────────
@stats_bp.route('/global', methods=['GET'])
def global_stats():
    reports = Report.query.all()
    sightings = Sighting.query.all()

    total_reports = len(reports)
    total_sightings = len(sightings)
    resolved = sum(1 for r in reports if r.status == 'resolved')
    pending = sum(1 for r in reports if r.status == 'pending')
    rejected = sum(1 for r in reports if r.status == 'rejected')

    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    monthly_reports = []
    for idx, month in enumerate(months):
        count = sum(1 for r in reports if r.created_at and r.created_at.month == idx+1 and r.created_at.year == datetime.utcnow().year)
        monthly_reports.append({'month': month, 'reports': count})

    sightings_trend = []
    for idx, month in enumerate(months):
        count = sum(1 for s in sightings if s.created_at and s.created_at.month == idx+1 and s.created_at.year == datetime.utcnow().year)
        sightings_trend.append({'month': month, 'sightings': count})

    type_map = {}
    for r in reports:
        type_map[r.incident_type] = type_map.get(r.incident_type, 0) + 1
    incident_types = [{'name': k, 'value': v} for k, v in type_map.items()]
    if not incident_types:
        incident_types = [{'name': 'No data', 'value': 1}]

    activities = []
    for r in sorted(reports, key=lambda x: x.created_at, reverse=True)[:3]:
        activities.append({
            'id': f'r-{r.id}',
            'type': 'report',
            'title': f'{r.incident_type} in {r.location}',
            'time': r.created_at.strftime('%d %b %Y'),
            'status': r.status
        })
    for s in sorted(sightings, key=lambda x: x.created_at, reverse=True)[:2]:
        activities.append({
            'id': f's-{s.id}',
            'type': 'sighting',
            'title': f'{s.species} sighted in {s.location}',
            'time': s.created_at.strftime('%d %b %Y'),
            'status': None
        })
    activities.sort(key=lambda x: x['time'], reverse=True)
    recent_activity = activities[:5]

    return jsonify({
        'stats': {
            'reports': total_reports,
            'sightings': total_sightings,
            'resolved': resolved,
            'pending': pending,
            'rejected': rejected,
        },
        'monthlyReports': monthly_reports,
        'sightingsData': sightings_trend,
        'incidentTypes': incident_types,
        'recentActivity': recent_activity,
    })

# ─── User‑specific stats (logged‑in user only) ──────────────────
@stats_bp.route('/user', methods=['GET'])
@jwt_required()
def user_stats():
    try:
        user_id = int(get_jwt_identity())
        print(f"🔍 DEBUG: user_id from token: {user_id}")
        
        user = User.query.get(user_id)
        if not user:
            print(f"❌ ERROR: User with ID {user_id} not found!")
            return jsonify({'error': 'User not found'}), 404

        print(f"✅ DEBUG: Found user: {user.email} (ID: {user.id})")

        # ─── Only fetch reports and sightings for this user ──────────
        reports = Report.query.filter_by(user_id=user.id).all()
        sightings = Sighting.query.filter_by(user_id=user.id).all()

        print(f"📊 DEBUG: Found {len(reports)} reports and {len(sightings)} sightings for user {user.id}")
        
        # Print first report if exists
        if reports:
            print(f"📋 First report: ID={reports[0].id}, Type={reports[0].incident_type}, Location={reports[0].location}")

        total_reports = len(reports)
        total_sightings = len(sightings)
        resolved = sum(1 for r in reports if r.status == 'resolved')
        pending = sum(1 for r in reports if r.status == 'pending')
        rejected = sum(1 for r in reports if r.status == 'rejected')

        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        monthly_reports = []
        for idx, month in enumerate(months):
            count = sum(1 for r in reports if r.created_at and r.created_at.month == idx+1 and r.created_at.year == datetime.utcnow().year)
            monthly_reports.append({'month': month, 'reports': count})

        sightings_trend = []
        for idx, month in enumerate(months):
            count = sum(1 for s in sightings if s.created_at and s.created_at.month == idx+1 and s.created_at.year == datetime.utcnow().year)
            sightings_trend.append({'month': month, 'sightings': count})

        type_map = {}
        for r in reports:
            type_map[r.incident_type] = type_map.get(r.incident_type, 0) + 1
        incident_types = [{'name': k, 'value': v} for k, v in type_map.items()]
        if not incident_types:
            incident_types = [{'name': 'No data', 'value': 1}]

        activities = []
        for r in sorted(reports, key=lambda x: x.created_at, reverse=True)[:3]:
            activities.append({
                'id': f'r-{r.id}',
                'type': 'report',
                'title': f'{r.incident_type} in {r.location}',
                'time': r.created_at.strftime('%d %b %Y'),
                'status': r.status
            })
        for s in sorted(sightings, key=lambda x: x.created_at, reverse=True)[:2]:
            activities.append({
                'id': f's-{s.id}',
                'type': 'sighting',
                'title': f'{s.species} sighted in {s.location}',
                'time': s.created_at.strftime('%d %b %Y'),
                'status': None
            })
        activities.sort(key=lambda x: x['time'], reverse=True)
        recent_activity = activities[:5]

        response = {
            'stats': {
                'reports': total_reports,
                'sightings': total_sightings,
                'resolved': resolved,
                'pending': pending,
                'rejected': rejected,
            },
            'monthlyReports': monthly_reports,
            'sightingsData': sightings_trend,
            'incidentTypes': incident_types,
            'recentActivity': recent_activity,
        }
        
        print(f"✅ DEBUG: Returning stats response with {total_reports} reports and {total_sightings} sightings")
        return jsonify(response), 200
        
    except Exception as e:
        print(f"❌ ERROR in user_stats: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500