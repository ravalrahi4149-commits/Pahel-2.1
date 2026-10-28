from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_db(app):
    db.init_app(app)
    with app.app_context():
        # Import models so SQLAlchemy discovers them
        from app.models.user import User
        from app.models.building import Building
        from app.models.inspection import Inspection
        from app.models.comparison import Comparison
        from app.models.notification import Notification
        db.create_all()
