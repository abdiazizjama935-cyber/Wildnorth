from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import create_access_token
import enum

db = SQLAlchemy()

class ReportType(enum.Enum):
    SIGHTING = 'sighting'
    CONFLICT = 'conflict'
    POACHING = 'poaching'
    INJURED = 'injured'
    OTHER = 'other'

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    full_name = db.Column(db.String(100))
    role = db.Column(db.String(20), default='community')  # community, ranger, agency, admin
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)

    reports = db.relationship('Report', backref='reporter', lazy=True)

    def get_token(self):
        return create_access_token(identity={'id': self.id, 'role': self.role})

class Report(db.Model):
    __tablename__ = 'reports'
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.Enum(ReportType), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text)
    photos = db.Column(db.JSON)  # list of filenames/URLs
    videos = db.Column(db.JSON)
    status = db.Column(db.String(20), default='pending')
    is_anonymous = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    extra_data = db.Column(db.JSON)  # flexible for species, count, etc.

class WildlifeSighting(db.Model):
    __tablename__ = 'wildlife_sightings'
    id = db.Column(db.Integer, primary_key=True)
    report_id = db.Column(db.Integer, db.ForeignKey('reports.id'))
    species = db.Column(db.String(100), nullable=False)
    count = db.Column(db.Integer)
    behavior = db.Column(db.String(50))
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    report = db.relationship('Report', backref=db.backref('sighting', uselist=False))

class Species(db.Model):
    __tablename__ = 'species'
    id = db.Column(db.Integer, primary_key=True)
    common_name = db.Column(db.String(100), nullable=False)
    scientific_name = db.Column(db.String(100))
    habitat = db.Column(db.Text)
    diet = db.Column(db.String(100))
    behavior = db.Column(db.Text)
    conservation_status = db.Column(db.String(50))
    distribution = db.Column(db.Text)
    fun_fact = db.Column(db.Text)
    image_url = db.Column(db.String(200))