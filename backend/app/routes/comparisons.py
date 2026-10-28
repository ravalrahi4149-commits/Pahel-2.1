from flask import Blueprint, request, jsonify, g
from app.config import Config
from app.database import db
from app.models.building import Building
from app.models.inspection import Inspection
from app.models.comparison import Comparison
from app.services.auth_helper import login_required
from app.services.alignment_service import align_and_compare_inspections

comparisons_bp = Blueprint("comparisons", __name__, url_prefix="/api/comparisons")

@comparisons_bp.route("", methods=["GET"])
@login_required
def list_comparisons():
    user = g.current_user
    query = Comparison.query.filter_by(user_id=user.id)

    building_id = request.args.get("buildingId")
    if building_id:
        query = query.filter_by(building_id=int(building_id))

    comps = query.order_by(Comparison.created_at.desc()).all()
    return jsonify({
        "comparisons": [c.to_dict() for c in comps],
        "total": len(comps),
    })


@comparisons_bp.route("", methods=["POST"])
@login_required
def create_comparison():
    user = g.current_user
    data = request.get_json() or {}

    building_id = data.get("buildingId")
    earlier_id = data.get("earlierInspectionId")
    later_id = data.get("laterInspectionId")
    notes = data.get("notes", "").strip()

    if not building_id or not earlier_id or not later_id:
        return jsonify({"error": "buildingId, earlierInspectionId, and laterInspectionId are required."}), 400

    if earlier_id == later_id:
        return jsonify({"error": "Cannot compare an inspection with itself. Choose two distinct inspection dates."}), 400

    building = Building.query.get(int(building_id))
    if not building or building.user_id != user.id:
        return jsonify({"error": "Building not found or unauthorized."}), 404

    insp_earlier = Inspection.query.get(int(earlier_id))
    insp_later = Inspection.query.get(int(later_id))

    if not insp_earlier or not insp_later:
        return jsonify({"error": "One or both inspections could not be found."}), 404

    # Ensure chronological order (if later was taken before earlier, swap them)
    if insp_earlier.inspection_date > insp_later.inspection_date:
        insp_earlier, insp_later = insp_later, insp_earlier

    # File paths
    e_img_path = Config.UPLOAD_FOLDER / insp_earlier.original_image_path
    l_img_path = Config.UPLOAD_FOLDER / insp_later.original_image_path
    e_mask_path = Config.MASK_FOLDER / insp_earlier.mask_image_path if insp_earlier.mask_image_path else None
    l_mask_path = Config.MASK_FOLDER / insp_later.mask_image_path if insp_later.mask_image_path else None

    # Perform alignment and difference visualization
    comp_result = align_and_compare_inspections(
        earlier_image_path=e_img_path,
        later_image_path=l_img_path,
        earlier_mask_path=e_mask_path,
        later_mask_path=l_mask_path,
        output_diff_dir=Config.DIFF_FOLDER,
        earlier_pct=insp_earlier.detected_pixel_percentage,
        later_pct=insp_later.detected_pixel_percentage,
    )

    comparison = Comparison(
        user_id=user.id,
        building_id=building.id,
        earlier_inspection_id=insp_earlier.id,
        later_inspection_id=insp_later.id,
        percentage_point_diff=comp_result["percentagePointDiff"],
        relative_percentage_change=comp_result["relativePercentageChange"],
        alignment_score=comp_result["alignmentScore"],
        diff_image_path=comp_result["diffImagePath"],
        notes=notes,
    )
    db.session.add(comparison)
    db.session.commit()

    return jsonify({
        "message": "Comparison generated successfully.",
        "comparison": comparison.to_dict(),
    }), 201


@comparisons_bp.route("/<int:comparison_id>", methods=["GET"])
@login_required
def get_comparison(comparison_id):
    comparison = Comparison.query.get_or_404(comparison_id)
    if comparison.user_id != g.current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    return jsonify({"comparison": comparison.to_dict()})


@comparisons_bp.route("/<int:comparison_id>", methods=["DELETE"])
@login_required
def delete_comparison(comparison_id):
    comparison = Comparison.query.get_or_404(comparison_id)
    if comparison.user_id != g.current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    if comparison.diff_image_path:
        diff_file = Config.DIFF_FOLDER / comparison.diff_image_path
        if diff_file.exists():
            diff_file.unlink()

    db.session.delete(comparison)
    db.session.commit()
    return jsonify({"message": "Comparison deleted."})
