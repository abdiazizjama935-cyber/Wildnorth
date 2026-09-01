from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from .config import Config
from .models import db

# Initialize extensions (no app context yet)
migrate = Migrate()
jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions with the app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # ----- Register Blueprints -----
    from .routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    # Optional: later add more blueprints
    # from .routes.reports import reports_bp
    # app.register_blueprint(reports_bp, url_prefix='/api/reports')

    # ----- Health check endpoint -----
    @app.route('/api/health')
    def health():
        return {"status": "ok", "message": "WildNorth Kenya API is running"}

    return app