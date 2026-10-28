import datetime
from app.database import db

class Building(db.Model):
    __tablename__ = "buildings"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    name = db.Column(db.String(255), nullable=False)
    identifier = db.Column(db.String(100), unique=True, nullable=False, index=True)
    address = db.Column(db.String(500), nullable=False)
    building_type = db.Column(db.String(100), default="Commercial")  # Residential, Commercial, Industrial, Infrastructure, Heritage
    floors = db.Column(db.Integer, default=1)
    year_built = db.Column(db.Integer, nullable=True)
    description = db.Column(db.Text, nullable=True)
    contact_person = db.Column(db.String(255), nullable=True)
    monitoring_status = db.Column(db.String(50), default="active")  # active, review_needed, archived
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    inspections = db.relationship("Inspection", backref="building", lazy=True, cascade="all, delete-orphan", order_by="desc(Inspection.inspection_date)")
    comparisons = db.relationship("Comparison", backref="building", lazy=True, cascade="all, delete-orphan")

    def to_dict(self, include_stats=False):
        data = {
            "id": self.id,
            "userId": self.user_id,
            "name": self.name,
            "identifier": self.identifier,
            "address": self.address,
            "buildingType": self.building_type,
            "floors": self.floors,
            "yearBuilt": self.year_built,
            "description": self.description,
            "contactPerson": self.contact_person,
            "monitoringStatus": self.monitoring_status,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
            "inspectionCount": len(self.inspections),
        }
        if include_stats and self.inspections:
            latest = self.inspections[0]
            data["latestInspectionDate"] = latest.inspection_date.isoformat() if latest.inspection_date else None
            data["latestDetectedAreaPct"] = latest.detected_pixel_percentage
            data["latestReviewStatus"] = latest.review_status
        return data
