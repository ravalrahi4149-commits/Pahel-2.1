import uuid
from flask import Blueprint, request, jsonify, g
from app.database import db
from app.models.building import Building
from app.services.auth_helper import login_required

buildings_bp = Blueprint("buildings", __name__, url_prefix="/api/buildings")

@buildings_bp.route("", methods=["GET"])
@login_required
def list_buildings():
    user = g.current_user
    query = Building.query.filter_by(user_id=user.id)

    # Search
    search = request.args.get("search", "").strip()
    if search:
        query = query.filter(
            (Building.name.ilike(f"%{search}%")) |
            (Building.identifier.ilike(f"%{search}%")) |
            (Building.address.ilike(f"%{search}%"))
        )

    # Filter by building type
    b_type = request.args.get("type", "").strip()
    if b_type:
        query = query.filter_by(building_type=b_type)

    # Filter by status
    status = request.args.get("status", "").strip()
    if status:
        query = query.filter_by(monitoring_status=status)

    buildings = query.order_by(Building.created_at.desc()).all()
    return jsonify({
        "buildings": [b.to_dict(include_stats=True) for b in buildings],
        "total": len(buildings),
    })


@buildings_bp.route("", methods=["POST"])
@login_required
def create_building():
    user = g.current_user
    data = request.get_json() or {}

    name = data.get("name", "").strip()
    address = data.get("address", "").strip()
    if not name or not address:
        return jsonify({"error": "Building name and address are required."}), 400

    identifier = data.get("identifier", "").strip()
    if not identifier:
        identifier = f"BLD-{uuid.uuid4().hex[:6].upper()}"

    # Check unique identifier
    if Building.query.filter_by(identifier=identifier).first():
        identifier = f"{identifier}-{uuid.uuid4().hex[:4].upper()}"

    building = Building(
        user_id=user.id,
        name=name,
        identifier=identifier,
        address=address,
        building_type=data.get("buildingType", "Commercial"),
        floors=int(data.get("floors", 1)),
        year_built=int(data.get("yearBuilt")) if data.get("yearBuilt") else None,
        description=data.get("description", ""),
        contact_person=data.get("contactPerson", ""),
        monitoring_status=data.get("monitoringStatus", "active"),
    )
    db.session.add(building)
    db.session.commit()

    return jsonify({"message": "Building registered successfully.", "building": building.to_dict()}), 201


@buildings_bp.route("/<int:building_id>", methods=["GET"])
@login_required
def get_building(building_id):
    building = Building.query.get_or_404(building_id)
    if building.user_id != g.current_user.id:
        return jsonify({"error": "Unauthorized access to this building."}), 403

    inspections = [insp.to_dict() for insp in building.inspections]
    data = building.to_dict(include_stats=True)
    data["inspections"] = inspections
    return jsonify({"building": data})


@buildings_bp.route("/<int:building_id>", methods=["PUT"])
@login_required
def update_building(building_id):
    building = Building.query.get_or_404(building_id)
    if building.user_id != g.current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json() or {}
    if "name" in data:
        building.name = data["name"].strip()
    if "address" in data:
        building.address = data["address"].strip()
    if "buildingType" in data:
        building.building_type = data["buildingType"]
    if "floors" in data:
        building.floors = int(data["floors"])
    if "yearBuilt" in data:
        building.year_built = int(data["yearBuilt"]) if data["yearBuilt"] else None
    if "description" in data:
        building.description = data["description"]
    if "contactPerson" in data:
        building.contact_person = data["contactPerson"]
    if "monitoringStatus" in data:
        building.monitoring_status = data["monitoringStatus"]

    db.session.commit()
    return jsonify({"message": "Building updated.", "building": building.to_dict(include_stats=True)})


@buildings_bp.route("/<int:building_id>", methods=["DELETE"])
@login_required
def delete_building(building_id):
    building = Building.query.get_or_404(building_id)
    if building.user_id != g.current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(building)
    db.session.commit()
    return jsonify({"message": "Building deleted successfully."})
