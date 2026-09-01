# ─── routes/__init__.py ───────────────────────────────────────────
# Import all blueprint instances from their respective modules.
# Each module must define a blueprint variable with the same name
# (e.g., auth.py -> auth_bp, reports.py -> reports_bp, etc.)

from .auth import auth_bp
from .reports import reports_bp
from .sightings import sightings_bp
from .encyclopedia import encyclopedia_bp
from .messages import messages_bp
from .support import support_bp
from .admin import admin_bp
from .notifications import notifications_bp
from .settings import settings_bp
from .stats import stats_bp   # <-- new

# ─── Export all blueprints for easy registration ────────────────
__all__ = [
    'auth_bp',
    'reports_bp',
    'sightings_bp',
    'encyclopedia_bp',
    'messages_bp',
    'support_bp',
    'admin_bp',
    'notifications_bp',
    'settings_bp',
    'stats_bp',
]