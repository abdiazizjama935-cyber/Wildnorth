from datetime import datetime, timezone

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import User, Report, Sighting

stats_bp = Blueprint('stats', __name__, url_prefix='/api/stats')

MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]


# ═══════════════════════════════════════════════════════════════
#  Helpers
# ═══════════════════════════════════════════════════════════════
def _current_year():
    """Timezone-aware current year (datetime.utcnow() is deprecated)."""
    return datetime.now(timezone.utc).year


def _resolve_user_id():
    """Return the integer user id from the JWT, or None if invalid."""
    identity = get_jwt_identity()
    try:
        return int(identity)
    except (TypeError, ValueError):
        return None


def _empty_payload():
    """
    Zeroed dashboard payload — exactly what a brand-new user should see.

    Returned before any aggregation runs, so a fresh account can never
    inherit numbers from a previous session or another user.
    """
    return {
        'stats': {
            'reports': 0,
            'sightings': 0,
            'resolved': 0,
            'pending': 0,
            'rejected': 0,
        },
        'monthlyReports': [{'month': m, 'reports': 0} for m in MONTHS],
        'sightingsData': [{'month': m, 'sightings': 0} for m in MONTHS],
        'incidentTypes': [],
        'recentActivity': [],
    }


def _build_payload(reports, sightings):
    """
    Build the dashboard payload from a concrete list of reports and
    sightings. Shared by both endpoints so the shape never drifts.
    """
    year = _current_year()

    # ─── Counts ────────────────────────────────────────────────
    total_reports = len(reports)
    total_sightings = len(sightings)
    resolved = sum(1 for r in reports if r.status == 'resolved')
    pending = sum(1 for r in reports if r.status == 'pending')
    rejected = sum(1 for r in reports if r.status == 'rejected')

    # ─── Monthly trend (reports + sightings in one pass) ──────
    monthly_reports = []
    sightings_trend = []
    for idx, month in enumerate(MONTHS):
        month_num = idx + 1
        monthly_reports.append({
            'month': month,
            'reports': sum(
                1 for r in reports
                if r.created_at
                and r.created_at.month == month_num
                and r.created_at.year == year
            ),
        })
        sightings_trend.append({
            'month': month,
            'sightings': sum(
                1 for s in sightings
                if s.created_at
                and s.created_at.month == month_num
                and s.created_at.year == year
            ),
        })

    # ─── Incident type breakdown ───────────────────────────────
    type_map = {}
    for r in reports:
        key = r.incident_type or 'Other'
        type_map[key] = type_map.get(key, 0) + 1
    incident_types = [{'name': k, 'value': v} for k, v in type_map.items()]

    # ─── Recent activity ───────────────────────────────────────
    # FIX: previously sorted formatted date *strings* ("01 Jan 2024"),
    # which produces the wrong order (day-of-month alphabetically first).
    # Sort on the real datetime, then format for display.
    combined = []

    for r in reports:
        if not r.created_at:
            continue
        combined.append((
            r.created_at,
            {
                'id': f'r-{r.id}',
                'type': 'report',
                'title': (
                    f'{r.incident_type or "Incident"} '
                    f'in {r.location or "unknown location"}'
                ),
                'time': r.created_at.strftime('%d %b %Y'),
                'status': r.status,
            },
        ))

    for s in sightings:
        if not s.created_at:
            continue
        combined.append((
            s.created_at,
            {
                'id': f's-{s.id}',
                'type': 'sighting',
                'title': (
                    f'{s.species or "Animal"} '
                    f'sighted in {s.location or "unknown location"}'
                ),
                'time': s.created_at.strftime('%d %b %Y'),
                'status': None,
            },
        ))

    combined.sort(key=lambda pair: pair[0], reverse=True)
    recent_activity = [item for _, item in combined[:5]]

    return {
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


# ═══════════════════════════════════════════════════════════════
#  Global aggregate — platform-wide overview
# ═══════════════════════════════════════════════════════════════
@stats_bp.route('/global', methods=['GET'])
@jwt_required()
def global_stats():
    """
    Platform-wide aggregate stats.

    ⚠️  This is NOT what a logged-in user's dashboard should call —
        use `/api/stats/user` for per-user data. Kept for admin /
        public overview screens, and now requires a valid JWT
        (it was previously open to anonymous callers).

    If you want to lock this down to admins only, add a claim check
    here, e.g.:

        from flask_jwt_extended import get_jwt
        if not get_jwt().get('is_admin'):
            return jsonify({'error': 'Admin only'}), 403
    """
    reports = Report.query.all()
    sightings = Sighting.query.all()
    return jsonify(_build_payload(reports, sightings)), 200


# ═══════════════════════════════════════════════════════════════
#  User-scoped stats — what the dashboard must use
# ═══════════════════════════════════════════════════════════════
@stats_bp.route('/user', methods=['GET'])
@stats_bp.route('/me', methods=['GET'])
@jwt_required()
def user_stats():
    """
    Dashboard payload scoped strictly to the authenticated user.

    A brand-new account receives a fully zeroed payload — it can
    never see another user's reports, sightings, or activity feed.
    """
    user_id = _resolve_user_id()
    if user_id is None:
        return jsonify({'error': 'Invalid token identity'}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    reports = Report.query.filter_by(user_id=user.id).all()
    sightings = Sighting.query.filter_by(user_id=user.id).all()

    # Short-circuit: brand-new user, nothing to compute.
    # Returning the zeroed payload here guarantees the frontend's
    # `isNewUser` check (reports === 0 && sightings === 0) fires
    # and the welcome screen is shown instead of empty charts.
    if not reports and not sightings:
        return jsonify(_empty_payload()), 200

    return jsonify(_build_payload(reports, sightings)), 200