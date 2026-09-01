from flask import Flask, send_from_directory
from config import Config
from extensions import db, jwt, cors
from routes import (
    auth_bp,
    reports_bp,
    sightings_bp,
    encyclopedia_bp,
    messages_bp,
    support_bp,
    admin_bp,
    notifications_bp,
    settings_bp,
    stats_bp,
)
from models import User, Report, Sighting, EncyclopediaEntry, Conversation, Message, SupportTicket, UserSettings, TicketReply
from datetime import datetime, timedelta
import os

def create_app():
    app = Flask(__name__)

    # ─── Disable strict slashes to avoid 308 redirects ──────────────
    app.url_map.strict_slashes = False

    # ─── Load config ──────────────────────────────────────────────────
    app.config.from_object(Config)

    # ─── Absolute database path ──────────────────────────────────────
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DB_PATH = os.path.join(BASE_DIR, 'database', 'wildlife.db')
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_PATH}'

    # ─── Upload folder for avatars ──────────────────────────────────
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

    # ─── Initialize extensions ──────────────────────────────────────
    db.init_app(app)
    jwt.init_app(app)

    # ✅ CORS: allow all origins, no credentials (token-based auth)
    cors.init_app(app, origins="*", supports_credentials=False)

    # ─── Register blueprints ──────────────────────────────────────
    app.register_blueprint(auth_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(sightings_bp)
    app.register_blueprint(encyclopedia_bp)
    app.register_blueprint(messages_bp)
    app.register_blueprint(support_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(settings_bp)
    app.register_blueprint(stats_bp)

    # ─── Static route for uploaded files ──────────────────────────
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    return app

app = create_app()

# ─── Database seeding ──────────────────────────────────────────────
with app.app_context():
    db.create_all()

    # 1. Admin user (with new fields added)
    admin_email = 'admin@wildnorth.org'
    admin = User.query.filter_by(email=admin_email).first()
    if not admin:
        admin = User(
            name='Admin User',
            email=admin_email,
            role='admin',
            phone='+254 700 000 000',
            location='Nairobi, Kenya',
            bio='WildNorth System Administrator',
            avatar_url=None
        )
        admin.set_password('admin123')
        db.session.add(admin)
        print("✅ Admin user created: admin@wildnorth.org / admin123")
    else:
        # Optionally update fields if they are empty
        if not admin.phone:
            admin.phone = '+254 700 000 000'
        if not admin.location:
            admin.location = 'Nairobi, Kenya'
        if not admin.bio:
            admin.bio = 'WildNorth System Administrator'
        db.session.add(admin)
        print("✅ Admin user already exists – updated with profile fields")

    # 2. Demo user (with new fields)
    demo_email = 'demo@wildnorth.org'
    demo = User.query.filter_by(email=demo_email).first()
    if not demo:
        demo = User(
            name='Demo User',
            email=demo_email,
            role='user',
            phone='+254 711 111 111',
            location='Garissa, Kenya',
            bio='WildNorth enthusiast and conservation volunteer.'
        )
        demo.set_password('password123')
        db.session.add(demo)
        print("✅ Demo user created: demo@wildnorth.org / password123")
    else:
        if not demo.check_password('password123'):
            demo.set_password('password123')
            print("✅ Demo password reset")
        if not demo.phone:
            demo.phone = '+254 711 111 111'
        if not demo.location:
            demo.location = 'Garissa, Kenya'
        if not demo.bio:
            demo.bio = 'WildNorth enthusiast and conservation volunteer.'
        db.session.add(demo)
        print("✅ Demo user updated with profile fields")

    # 3. Public user (for unauthenticated reports)
    public_email = 'public@wildnorth.org'
    public = User.query.filter_by(email=public_email).first()
    if not public:
        public = User(
            name='Public User',
            email=public_email,
            role='public',
            phone=None,
            location=None,
            bio=None
        )
        public.set_password('public123')
        db.session.add(public)
        print("✅ Public user created for unauthenticated reports")

    # 4. Seed encyclopedia entries (minimal)
    if EncyclopediaEntry.query.count() == 0:
        entries = [
            EncyclopediaEntry(
                name='African Elephant',
                scientific_name='Loxodonta africana',
                status='Endangered',
                habitat='Savanna, Forest',
                diet='Herbivore',
                size='Up to 4m tall, 6,000 kg',
                image_url='https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=600&q=80',
                description='The largest land animal, known for its intelligence and strong social bonds.'
            ),
            # Add more entries as needed
        ]
        db.session.add_all(entries)
        print("✅ Seeded encyclopedia entries")

    # 5. Sample reports for demo user (if empty)
    if Report.query.count() == 0:
        demo_user = User.query.filter_by(email=demo_email).first()
        if demo_user:
            sample_reports = [
                Report(
                    user_id=demo_user.id,
                    incident_type='Human-Wildlife Conflict',
                    species='Elephant',
                    location='Garissa',
                    description='Elephant destroyed crops in village.',
                    date_time=datetime.utcnow() - timedelta(days=2),
                    status='pending'
                ),
                Report(
                    user_id=demo_user.id,
                    incident_type='Poaching',
                    species='Rhinoceros',
                    location='Meru',
                    description='Rhino found dead with horn removed.',
                    date_time=datetime.utcnow() - timedelta(days=5),
                    status='resolved'
                ),
            ]
            db.session.add_all(sample_reports)
            print("✅ Seeded reports for demo user")

    # 6. Sample sightings for demo user (if empty)
    if Sighting.query.count() == 0:
        demo_user = User.query.filter_by(email=demo_email).first()
        if demo_user:
            sample_sightings = [
                Sighting(
                    user_id=demo_user.id,
                    species='African Elephant',
                    location='Tsavo',
                    count=3,
                    behaviour='Feeding',
                    notes='Herd of elephants near the river.',
                    date_time=datetime.utcnow() - timedelta(days=2)
                ),
                Sighting(
                    user_id=demo_user.id,
                    species='Lion',
                    location='Samburu',
                    count=5,
                    behaviour='Resting',
                    notes='Pride resting in the shade.',
                    date_time=datetime.utcnow() - timedelta(days=1)
                ),
            ]
            db.session.add_all(sample_sightings)
            print("✅ Seeded sightings for demo user")

    # 7. Sample conversation between admin and demo user
    if Conversation.query.count() == 0:
        admin_user = User.query.filter_by(email=admin_email).first()
        demo_user = User.query.filter_by(email=demo_email).first()
        if admin_user and demo_user:
            conv = Conversation(
                participants=f"{admin_user.id},{demo_user.id}",
                last_message="Welcome to WildNorth!",
                last_message_time=datetime.utcnow()
            )
            db.session.add(conv)
            msg = Message(
                conversation=conv,
                sender_id=admin_user.id,
                content="Hello! Welcome to WildNorth. Let me know if you need any help."
            )
            db.session.add(msg)
            print("✅ Seeded sample conversation")

    db.session.commit()
    print("✅ Database initialized and fully seeded.")

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)