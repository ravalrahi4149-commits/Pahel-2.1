from flask import Blueprint, jsonify, g, request
from app.database import db
from app.models.building import Building
from app.models.inspection import Inspection
from app.models.comparison import Comparison
from app.services.auth_helper import login_required

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")

@dashboard_bp.route("/stats", methods=["GET"])
@login_required
def get_stats():
    user = g.current_user

    total_buildings = Building.query.filter_by(user_id=user.id).count()
    inspections_query = Inspection.query.filter_by(user_id=user.id)
    total_inspections = inspections_query.count()

    verified_count = inspections_query.filter_by(review_status="verified_record").count()
    review_needed_count = inspections_query.filter_by(review_status="requires_qualified_review").count()
    pending_count = inspections_query.filter_by(review_status="pending_review").count()

    # Recent inspections
    recent_inspections = (
        inspections_query.order_by(Inspection.inspection_date.desc()).limit(6).all()
    )

    # Buildings requiring review
    flagged_buildings = (
        Building.query.filter_by(user_id=user.id, monitoring_status="review_needed")
        .limit(5)
        .all()
    )

    # Surface type distribution
    all_inspections = inspections_query.all()
    surface_counts = {}
    for insp in all_inspections:
        surface_counts[insp.surface_type] = surface_counts.get(insp.surface_type, 0) + 1

    surface_distribution = [
        {"name": k, "value": v} for k, v in surface_counts.items()
    ]

    # Inspection timeline / crack area trends
    timeline_records = []
    sorted_insp = sorted(all_inspections, key=lambda x: x.inspection_date)
    for insp in sorted_insp[-10:]:
        timeline_records.append({
            "id": insp.id,
            "date": insp.inspection_date.strftime("%b %d"),
            "buildingName": insp.building.name if insp.building else "Asset",
            "detectedAreaPct": round(insp.detected_pixel_percentage, 3),
            "regionCount": insp.region_count,
        })

    # Average detected area
    avg_area_pct = (
        sum(i.detected_pixel_percentage for i in all_inspections) / len(all_inspections)
        if all_inspections
        else 0.0
    )

    return jsonify({
        "totalBuildings": total_buildings,
        "totalInspections": total_inspections,
        "verifiedCount": verified_count,
        "reviewNeededCount": review_needed_count,
        "pendingCount": pending_count,
        "averageCrackAreaPct": round(avg_area_pct, 3),
        "recentInspections": [i.to_dict() for i in recent_inspections],
        "flaggedBuildings": [b.to_dict() for b in flagged_buildings],
        "surfaceDistribution": surface_distribution,
        "trendTimeline": timeline_records,
    })
