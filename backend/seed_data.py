from app import app, db
from models import User, Report, Sighting
from datetime import datetime, timedelta

with app.app_context():
    demo_user = User.query.filter_by(email='demo@wildnorth.org').first()
    if not demo_user:
        print("❌ Demo user not found. Create one first.")
        exit()

    # Add sample reports
    if Report.query.count() == 0:
        reports = [
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
        db.session.add_all(reports)
        print("✅ Seeded reports")

    # Add sample sightings
    if Sighting.query.count() == 0:
        sightings = [
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
        db.session.add_all(sightings)
        print("✅ Seeded sightings")

    db.session.commit()
    print("✅ Database seeded successfully!")