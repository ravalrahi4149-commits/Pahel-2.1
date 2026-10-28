import datetime
import json
from app.database import db

class Inspection(db.Model):
    __tablename__ = "inspections"

    id = db.Column(db.Integer, primary_key=True)
    building_id = db.Column(db.Integer, db.ForeignKey("buildings.id"), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    inspection_date = db.Column(db.DateTime, default=datetime.datetime.utcnow, nullable=False, index=True)
    surface_type = db.Column(db.String(100), default="Wall")  # Wall, Ceiling, Beam, Column, Slab, Other
    location = db.Column(db.String(255), nullable=False)  # e.g., North Wall, Ground Floor
    notes = db.Column(db.Text, nullable=True)

    # File paths (relative to storage directory)
    original_image_path = db.Column(db.String(500), nullable=False)
    overlay_image_path = db.Column(db.String(500), nullable=True)
    mask_image_path = db.Column(db.String(500), nullable=True)

    # Detection & Analysis Results
    detection_method = db.Column(db.String(100), default="Classical Computer Vision (OpenCV/PIL)")
    model_version = db.Column(db.String(50), default="v1.0-cv-baseline")
    image_width = db.Column(db.Integer, default=0)
    image_height = db.Column(db.Integer, default=0)
    detected_pixel_area = db.Column(db.Integer, default=0)
    detected_pixel_percentage = db.Column(db.Float, default=0.0)
    region_count = db.Column(db.Integer, default=0)
    _regions_data = db.Column("regions_data", db.Text, default="[]")
    
    # Scale & Physical calibration (optional mm per pixel)
    calibration_factor = db.Column(db.Float, nullable=True)  # mm per pixel
    processing_duration_ms = db.Column(db.Integer, default=0)
    
    # Human Review Workflow
    review_status = db.Column(db.String(50), default="pending_review")  # pending_review, verified_record, requires_qualified_review
    reviewer_notes = db.Column(db.Text, nullable=True)
    _warnings = db.Column("warnings", db.Text, default="[]")
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    @property
    def regions_data(self):
        try:
            return json.loads(self._regions_data or "[]")
        except Exception:
            return []

    @regions_data.setter
    def regions_data(self, val):
        self._regions_data = json.dumps(val if val is not None else [])

    @property
    def warnings(self):
        try:
            return json.loads(self._warnings or "[]")
        except Exception:
            return []

    @warnings.setter
    def warnings(self, val):
        if isinstance(val, (list, dict)):
            self._warnings = json.dumps(val)
        elif isinstance(val, str):
            self._warnings = val
        else:
            self._warnings = "[]"

    @property
    def warnings_list(self):
        return self.warnings

    @warnings_list.setter
    def warnings_list(self, val):
        self.warnings = val
        self.warnings = json.dumps(val if val is not None else [])

    def to_dict(self):
        return {
            "id": self.id,
            "buildingId": self.building_id,
            "buildingName": self.building.name if self.building else None,
            "userId": self.user_id,
            "inspectorName": self.inspector.full_name if self.inspector else None,
            "inspectionDate": self.inspection_date.isoformat() if self.inspection_date else None,
            "surfaceType": self.surface_type,
            "location": self.location,
            "notes": self.notes,
            "originalImageUrl": f"/api/media/image/{self.original_image_path}" if self.original_image_path else None,
            "overlayImageUrl": f"/api/media/image/{self.overlay_image_path}" if self.overlay_image_path else None,
            "maskImageUrl": f"/api/media/image/{self.mask_image_path}" if self.mask_image_path else None,
            "detectionMethod": self.detection_method,
            "modelVersion": self.model_version,
            "imageWidth": self.image_width,
            "imageHeight": self.image_height,
            "detectedPixelArea": self.detected_pixel_area,
            "detectedPixelPercentage": round(self.detected_pixel_percentage, 3),
            "regionCount": self.region_count,
            "regionsData": self.regions_data,
            "calibrationFactor": self.calibration_factor,
            "estimatedPhysicalAreaMm2": round(self.detected_pixel_area * (self.calibration_factor ** 2), 2) if self.calibration_factor else None,
            "processingDurationMs": self.processing_duration_ms,
            "reviewStatus": self.review_status,
            "reviewerNotes": self.reviewer_notes,
            "warnings": self.warnings_list,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
