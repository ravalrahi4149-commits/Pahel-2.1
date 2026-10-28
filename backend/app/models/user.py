import datetime
import hashlib
from app.database import db

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(50), default="inspector")  # admin, inspector, engineer
    organization = db.Column(db.String(255), default="Structural Diagnostics Lab")
    language_preference = db.Column(db.String(10), default="en")  # en, gu
    theme_preference = db.Column(db.String(10), default="dark")  # dark, light
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    buildings = db.relationship("Building", backref="owner", lazy=True, cascade="all, delete-orphan")
    inspections = db.relationship("Inspection", backref="inspector", lazy=True, cascade="all, delete-orphan")
    comparisons = db.relationship("Comparison", backref="user", lazy=True, cascade="all, delete-orphan")
    notifications = db.relationship("Notification", backref="recipient", lazy=True, cascade="all, delete-orphan")

    def set_password(self, password: str):
        # Secure salt and sha256 hash (or bcrypt if available)
        salt = "cracklife_salt_2026_"
        self.password_hash = hashlib.sha256((salt + password).encode()).hexdigest()

    def check_password(self, password: str) -> bool:
        salt = "cracklife_salt_2026_"
        return self.password_hash == hashlib.sha256((salt + password).encode()).hexdigest()

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "fullName": self.full_name,
            "role": self.role,
            "organization": self.organization,
            "languagePreference": self.language_preference,
            "themePreference": self.theme_preference,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
