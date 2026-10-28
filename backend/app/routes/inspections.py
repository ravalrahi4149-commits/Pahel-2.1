import uuid
import datetime
from pathlib import Path
from flask import Blueprint, request, jsonify, g
from werkzeug.utils import secure_filename
from PIL import Image

from app.config import Config
from app.database import db
from app.models.building import Building
from app.models.inspection import Inspection
from app.models.notification import Notification
from app.services.auth_helper import login_required
from app.services.ml_service import detect_cracks

inspections_bp = Blueprint("inspections", __name__, url_prefix="/api/inspections")

@inspections_bp.route("", methods=["GET"])
@login_required
def list_inspections():
    user = g.current_user
    query = Inspection.query.filter_by(user_id=user.id)

    # Building filter
    building_id = request.args.get("buildingId")
    if building_id:
        query = query.filter_by(building_id=int(building_id))

    # Surface type filter
    surface_type = request.args.get("surfaceType")
    if surface_type:
        query = query.filter_by(surface_type=surface_type)

    # Review status filter
    review_status = request.args.get("reviewStatus")
    if review_status:
        query = query.filter_by(review_status=review_status)

    inspections = query.order_by(Inspection.inspection_date.desc()).all()
    return jsonify({
        "inspections": [insp.to_dict() for insp in inspections],
        "total": len(inspections),
    })


@inspections_bp.route("/upload", methods=["POST"])
@login_required
def upload_and_analyze():
    user = g.current_user

    # 1. Validate file existence
    if "image" not in request.files:
        return jsonify({"error": "No image file provided in upload request."}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "No file selected."}), 400

    # 2. Check extension
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in Config.ALLOWED_EXTENSIONS:
        return jsonify({"error": f"Unsupported file type '{ext}'. Allowed formats: {', '.join(Config.ALLOWED_EXTENSIONS)}"}), 400

    # 3. Read form data
    building_id = request.form.get("buildingId")
    if not building_id:
        return jsonify({"error": "buildingId is required."}), 400

    building = Building.query.get(int(building_id))
    if not building or building.user_id != user.id:
        return jsonify({"error": "Target building not found or unauthorized."}), 404

    surface_type = request.form.get("surfaceType", "Wall")
    location = request.form.get("location", "Surface Section 1").strip()
    notes = request.form.get("notes", "").strip()
    preferred_mode = request.form.get("preferredMode", "auto")
    
    calibration_factor = None
    if request.form.get("calibrationFactor"):
        try:
            calibration_factor = float(request.form.get("calibrationFactor"))
        except ValueError:
            pass

    # 4. Save and validate image content by decoding with Pillow
    saved_filename = f"insp_{uuid.uuid4().hex[:12]}.{ext}"
    saved_path = Config.UPLOAD_FOLDER / saved_filename
    file.save(saved_path)

    try:
        with Image.open(saved_path) as test_img:
            test_img.verify()
    except Exception as e:
        if saved_path.exists():
            saved_path.unlink()
        return jsonify({"error": "Uploaded file is corrupted or not a valid image."}), 400

    # 5. Run Crack Detection Pipeline
    result = detect_cracks(
        image_path=saved_path,
        output_overlay_dir=Config.OVERLAY_FOLDER,
        output_mask_dir=Config.MASK_FOLDER,
        preferred_mode=preferred_mode,
    )

    # 6. Determine review status based on detected area
    review_status = "pending_review"
    if result.detected_pixel_percentage > 0.4 or result.region_count > 3:
        review_status = "requires_qualified_review"

    # 7. Persist Inspection record
    inspection = Inspection(
        building_id=building.id,
        user_id=user.id,
        inspection_date=datetime.datetime.utcnow(),
        surface_type=surface_type,
        location=location,
        notes=notes,
        original_image_path=saved_filename,
        overlay_image_path=result.overlay_path,
        mask_image_path=result.mask_path,
        detection_method=result.detection_method,
        model_version=result.model_version,
        image_width=result.width,
        image_height=result.height,
        detected_pixel_area=result.detected_pixel_area,
        detected_pixel_percentage=result.detected_pixel_percentage,
        region_count=result.region_count,
        calibration_factor=calibration_factor,
        processing_duration_ms=result.processing_duration_ms,
        review_status=review_status,
        warnings=result.warnings,
    )
    inspection.regions_data = result.regions_data

    db.session.add(inspection)
    db.session.commit()

    # 8. Create notification
    notif = Notification(
        user_id=user.id,
        title="Inspection Analysis Complete",
        message=f"Surface at '{building.name} - {location}' analyzed: {result.detected_pixel_percentage:.2f}% crack pixel density detected.",
        notification_type="review_alert" if review_status == "requires_qualified_review" else "success",
        link=f"/inspections/{inspection.id}",
    )
    db.session.add(notif)
    db.session.commit()

    return jsonify({
        "message": "Inspection created and processed successfully.",
        "inspection": inspection.to_dict(),
    }), 201


@inspections_bp.route("/<int:inspection_id>", methods=["GET"])
@login_required
def get_inspection(inspection_id):
    inspection = Inspection.query.get_or_404(inspection_id)
    if inspection.user_id != g.current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    return jsonify({"inspection": inspection.to_dict()})


@inspections_bp.route("/<int:inspection_id>/review", methods=["PUT"])
@login_required
def update_inspection_review(inspection_id):
    inspection = Inspection.query.get_or_404(inspection_id)
    if inspection.user_id != g.current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json() or {}
    if "reviewStatus" in data:
        inspection.review_status = data["reviewStatus"]
    if "reviewerNotes" in data:
        inspection.reviewer_notes = data["reviewerNotes"]
    if "notes" in data:
        inspection.notes = data["notes"]

    db.session.commit()
    return jsonify({
        "message": "Inspection review recorded.",
        "inspection": inspection.to_dict(),
    })


@inspections_bp.route("/<int:inspection_id>", methods=["DELETE"])
@login_required
def delete_inspection(inspection_id):
    inspection = Inspection.query.get_or_404(inspection_id)
    if inspection.user_id != g.current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    # Clean up files if possible
    for p in [
        Config.UPLOAD_FOLDER / inspection.original_image_path if inspection.original_image_path else None,
        Config.OVERLAY_FOLDER / inspection.overlay_image_path if inspection.overlay_image_path else None,
        Config.MASK_FOLDER / inspection.mask_image_path if inspection.mask_image_path else None,
    ]:
        if p and p.exists():
            try:
                p.unlink()
            except Exception:
                pass

    db.session.delete(inspection)
    db.session.commit()
    return jsonify({"message": "Inspection deleted successfully."})
