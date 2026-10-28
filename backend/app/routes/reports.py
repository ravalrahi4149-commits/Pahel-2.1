from flask import Blueprint, send_file, Response, jsonify, g
from app.config import Config
from app.database import db
from app.models.building import Building
from app.models.inspection import Inspection
from app.services.auth_helper import login_required
from app.services.report_service import generate_inspection_pdf, generate_inspections_csv

reports_bp = Blueprint("reports", __name__, url_prefix="/api/reports")

@reports_bp.route("/inspection/<int:inspection_id>/pdf", methods=["GET"])
@login_required
def download_inspection_report(inspection_id):
    inspection = Inspection.query.get_or_404(inspection_id)
    if inspection.user_id != g.current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    building = inspection.building
    inspector = inspection.inspector

    pdf_path = generate_inspection_pdf(inspection, building, inspector)

    return send_file(
        pdf_path,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=f"CrackLife_Report_{building.identifier}_Insp_{inspection.id}.pdf",
    )


@reports_bp.route("/inspections/csv", methods=["GET"])
@login_required
def export_inspections_csv():
    user = g.current_user
    inspections = (
        Inspection.query.filter_by(user_id=user.id)
        .order_by(Inspection.inspection_date.desc())
        .all()
    )

    csv_data = generate_inspections_csv(inspections)
    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=CrackLife_Inspections.csv"},
    )
