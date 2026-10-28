import datetime
from app.database import db

class Comparison(db.Model):
    __tablename__ = "comparisons"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    building_id = db.Column(db.Integer, db.ForeignKey("buildings.id"), nullable=False, index=True)
    earlier_inspection_id = db.Column(db.Integer, db.ForeignKey("inspections.id"), nullable=False)
    later_inspection_id = db.Column(db.Integer, db.ForeignKey("inspections.id"), nullable=False)

    percentage_point_diff = db.Column(db.Float, default=0.0)
    relative_percentage_change = db.Column(db.Float, nullable=True)
    alignment_score = db.Column(db.Float, default=0.0)  # 0 to 100
    diff_image_path = db.Column(db.String(500), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    earlier_inspection = db.relationship("Inspection", foreign_keys=[earlier_inspection_id])
    later_inspection = db.relationship("Inspection", foreign_keys=[later_inspection_id])

    def to_dict(self):
        earlier_date = self.earlier_inspection.inspection_date if self.earlier_inspection else None
        later_date = self.later_inspection.inspection_date if self.later_inspection else None
        elapsed_days = (later_date - earlier_date).days if (earlier_date and later_date) else None

        return {
            "id": self.id,
            "userId": self.user_id,
            "buildingId": self.building_id,
            "buildingName": self.building.name if self.building else None,
            "earlierInspectionId": self.earlier_inspection_id,
            "laterInspectionId": self.later_inspection_id,
            "earlierInspection": self.earlier_inspection.to_dict() if self.earlier_inspection else None,
            "laterInspection": self.later_inspection.to_dict() if self.later_inspection else None,
            "percentagePointDiff": round(self.percentage_point_diff, 3),
            "relativePercentageChange": round(self.relative_percentage_change, 2) if self.relative_percentage_change is not None else None,
            "alignmentScore": round(self.alignment_score, 1),
            "diffImageUrl": f"/api/media/image/{self.diff_image_path}" if self.diff_image_path else None,
            "elapsedDays": elapsed_days,
            "notes": self.notes,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
