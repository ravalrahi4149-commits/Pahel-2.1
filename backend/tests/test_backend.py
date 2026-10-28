import pytest
import os
import io
from pathlib import Path
from PIL import Image

from app import create_app
from app.config import Config
from app.database import db
from app.services.seed_service import create_synthetic_crack_image
from app.services.cv_service import detect_cracks_classical
from app.services.alignment_service import align_and_compare_inspections

@pytest.fixture
def app():
    os.environ["SECRET_KEY"] = "test-secret"
    app = create_app()
    app.config["TESTING"] = True
    with app.app_context():
        from app.services.seed_service import seed_database
        seed_database()
    yield app

@pytest.fixture
def client(app):
    return app.test_client()

def test_health_endpoint(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "healthy"
    assert "CrackLife AI" in data["service"]

def test_cv_detection_pipeline(tmp_path):
    img_path = tmp_path / "test_wall.jpg"
    overlay_dir = tmp_path / "overlays"
    mask_dir = tmp_path / "masks"
    overlay_dir.mkdir()
    mask_dir.mkdir()

    create_synthetic_crack_image(img_path, width=400, height=300, crack_intensity=1.2, seed=99)
    result = detect_cracks_classical(img_path, overlay_dir, mask_dir)

    assert result.width == 400
    assert result.height == 300
    assert result.detected_pixel_area > 0
    assert result.detected_pixel_percentage > 0.0
    assert (overlay_dir / result.overlay_path).exists()
    assert (mask_dir / result.mask_path).exists()
    assert len(result.warnings) > 0

def test_comparison_mathematical_formulas(tmp_path):
    diff_dir = tmp_path / "diffs"
    diff_dir.mkdir()

    img1 = tmp_path / "img1.jpg"
    img2 = tmp_path / "img2.jpg"
    create_synthetic_crack_image(img1, width=300, height=200, seed=1)
    create_synthetic_crack_image(img2, width=300, height=200, seed=2)

    earlier_pct = 1.20
    later_pct = 1.80

    comp = align_and_compare_inspections(
        earlier_image_path=img1,
        later_image_path=img2,
        earlier_mask_path=None,
        later_mask_path=None,
        output_diff_dir=diff_dir,
        earlier_pct=earlier_pct,
        later_pct=later_pct,
    )

    # Percentage-point difference = later - earlier
    expected_pp_diff = 1.80 - 1.20  # 0.60
    assert abs(comp["percentagePointDiff"] - expected_pp_diff) < 1e-4

    # Relative percentage change = (diff / earlier) * 100
    expected_rel_change = (0.60 / 1.20) * 100.0  # 50.0%
    assert abs(comp["relativePercentageChange"] - expected_rel_change) < 1e-4
    assert 0.0 <= comp["alignmentScore"] <= 100.0

def test_auth_and_buildings_api(client):
    # Test Register
    reg_res = client.post("/api/auth/register", json={
        "email": "test_engineer@cracklife.ai",
        "password": "Password123!",
        "fullName": "Test Engineer",
        "organization": "Test Lab",
    })
    assert reg_res.status_code in [201, 409]

    # Test Login
    login_res = client.post("/api/auth/login", json={
        "email": "demo@cracklife.ai",
        "password": "CrackLife2026!",
    })
    assert login_res.status_code == 200
    token = login_res.get_json()["token"]

    # Test List Buildings
    headers = {"Authorization": f"Bearer {token}"}
    bld_res = client.get("/api/buildings", headers=headers)
    assert bld_res.status_code == 200
    assert "buildings" in bld_res.get_json()

    # Test Dashboard Stats
    dash_res = client.get("/api/dashboard/stats", headers=headers)
    assert dash_res.status_code == 200
    stats = dash_res.get_json()
    assert "totalBuildings" in stats
    assert "totalInspections" in stats

def test_pdf_and_csv_reports(client, app):
    login_res = client.post("/api/auth/login", json={
        "email": "demo@cracklife.ai",
        "password": "CrackLife2026!",
    })
    token = login_res.get_json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # CSV report
    csv_res = client.get("/api/reports/inspections/csv", headers=headers)
    assert csv_res.status_code == 200
    assert b"Inspection ID" in csv_res.data

    # PDF report for first inspection
    with app.app_context():
        from app.models.inspection import Inspection
        insp = Inspection.query.first()
        insp_id = insp.id

    pdf_res = client.get(f"/api/reports/inspection/{insp_id}/pdf", headers=headers)
    assert pdf_res.status_code == 200
    assert pdf_res.data.startswith(b"%PDF")
