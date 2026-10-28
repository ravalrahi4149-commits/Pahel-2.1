import datetime
import random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

from app.config import Config
from app.database import db
from app.models.user import User
from app.models.building import Building
from app.models.inspection import Inspection
from app.models.comparison import Comparison
from app.models.notification import Notification
from app.services.cv_service import detect_cracks_classical
from app.services.alignment_service import align_and_compare_inspections

def create_synthetic_crack_image(
    output_path: Path,
    width: int = 800,
    height: int = 600,
    crack_intensity: float = 1.0,
    seed: int = 42,
):
    """
    Synthesizes a realistic concrete / plaster wall surface with hairline crack fissures.
    """
    random.seed(seed)
    np.random.seed(seed)

    # 1. Base concrete wall texture: light gray with subtle grain
    noise = np.random.normal(loc=195, scale=12, size=(height, width)).astype(np.uint8)
    wall_img = Image.fromarray(noise, mode="L").convert("RGB")
    wall_img = wall_img.filter(ImageFilter.GaussianBlur(radius=0.8))
    draw = ImageDraw.Draw(wall_img)

    # 2. Draw jagged crack paths
    num_cracks = max(1, int(2 * crack_intensity))
    for c in range(num_cracks):
        # Start coordinate
        curr_x = random.randint(int(width * 0.2), int(width * 0.5))
        curr_y = random.randint(int(height * 0.15), int(height * 0.35))
        
        path_points = [(curr_x, curr_y)]
        num_segments = int(35 * crack_intensity)
        
        for _ in range(num_segments):
            dx = random.randint(-4, 14)
            dy = random.randint(6, 18)
            curr_x = max(10, min(width - 10, curr_x + dx))
            curr_y = max(10, min(height - 10, curr_y + dy))
            path_points.append((curr_x, curr_y))
            
            # Optional micro-branching
            if random.random() < 0.25:
                branch_x = curr_x + random.randint(5, 20)
                branch_y = curr_y + random.randint(2, 10)
                draw.line([(curr_x, curr_y), (branch_x, branch_y)], fill=(70, 70, 75), width=1)

        # Draw main jagged fissure with varying line thickness
        for i in range(len(path_points) - 1):
            thickness = random.choice([1, 2, 2, 3]) if crack_intensity > 1.2 else random.choice([1, 2])
            darkness = random.randint(40, 75)
            draw.line([path_points[i], path_points[i+1]], fill=(darkness, darkness, darkness + 5), width=thickness)

    # Add slight blur to simulate camera depth of field
    wall_img = wall_img.filter(ImageFilter.GaussianBlur(radius=0.5))
    wall_img.save(output_path, "JPEG", quality=92)


def seed_database():
    """Seeds the database with a default demo user and realistic structural inspections."""
    Config.init_app()

    # Check if demo user already exists
    demo_user = User.query.filter_by(email="demo@cracklife.ai").first()
    if not demo_user:
        demo_user = User(
            email="demo@cracklife.ai",
            full_name="Dr. Elena Vance, P.E.",
            role="lead_inspector",
            organization="Apex Structural Health Diagnostic Lab",
            language_preference="en",
            theme_preference="dark",
        )
        demo_user.set_password("CrackLife2026!")
        db.session.add(demo_user)
        db.session.commit()

    if Inspection.query.filter_by(user_id=demo_user.id).count() > 0:
        return demo_user

    b1 = Building.query.filter_by(identifier="BLD-MT-2024-B").first()
    b2 = Building.query.filter_by(identifier="INF-RCV-004").first()
    b3 = Building.query.filter_by(identifier="HRT-HAS-1922").first()

    if not b1 or not b2 or not b3:
        b1 = Building(
            user_id=demo_user.id,
            name="Metro Tower Commercial Complex",
            identifier="BLD-MT-2024-B",
            address="442 Westview Boulevard, Financial District",
            building_type="Commercial",
            floors=14,
            year_built=2016,
            description="High-rise reinforced concrete framed commercial building with cantilevered podium.",
            contact_person="Civil Infrastructure Management Directorate",
            monitoring_status="active",
        )
        b2 = Building(
            user_id=demo_user.id,
            name="Riverside Concrete Viaduct Pier 4",
            identifier="INF-RCV-004",
            address="Pier Column 4B, State Highway 10 Viaduct",
            building_type="Infrastructure",
            floors=1,
            year_built=2008,
            description="Reinforced concrete bridge support pier subjected to diurnal thermal expansion cycles.",
            contact_person="DOT Bridge Inspection Bureau",
            monitoring_status="review_needed",
        )
        b3 = Building(
            user_id=demo_user.id,
            name="Heritage Arcade South Gallery",
            identifier="HRT-HAS-1922",
            address="12 Old Town Esplanade",
            building_type="Heritage",
            floors=3,
            year_built=1922,
            description="Historic unreinforced brick masonry arcade with decorative lime plaster rendering.",
            contact_person="Historical Preservation Trust",
            monitoring_status="active",
        )
        db.session.add_all([b1, b2, b3])
        db.session.commit()

    # Create synthetic inspection images and run detection
    now = datetime.datetime.utcnow()
    
    # Building 1 - Inspection 1 (Earlier: 60 days ago)
    img1_name = "sample_b1_t1.jpg"
    img1_path = Config.UPLOAD_FOLDER / img1_name
    create_synthetic_crack_image(img1_path, width=800, height=600, crack_intensity=1.0, seed=101)
    res1 = detect_cracks_classical(img1_path, Config.OVERLAY_FOLDER, Config.MASK_FOLDER)

    insp1 = Inspection(
        building_id=b1.id,
        user_id=demo_user.id,
        inspection_date=now - datetime.timedelta(days=60),
        surface_type="Beam Surface",
        location="Podium Level 2, Column B4 Joint",
        notes="Initial baseline documentation of shear hairline fissure across shear key.",
        original_image_path=img1_name,
        overlay_image_path=res1.overlay_path,
        mask_image_path=res1.mask_path,
        detection_method=res1.detection_method,
        model_version=res1.model_version,
        image_width=res1.width,
        image_height=res1.height,
        detected_pixel_area=res1.detected_pixel_area,
        detected_pixel_percentage=res1.detected_pixel_percentage,
        region_count=res1.region_count,
        calibration_factor=0.25,  # 0.25 mm/px
        processing_duration_ms=res1.processing_duration_ms,
        review_status="verified_record",
        reviewer_notes="Baseline inspection validated. Surface fissure conforms to non-structural shrinkage envelope.",
        warnings=res1.warnings,
    )
    insp1.regions_data = res1.regions_data

    # Building 1 - Inspection 2 (Later: 5 days ago, grew slightly)
    img2_name = "sample_b1_t2.jpg"
    img2_path = Config.UPLOAD_FOLDER / img2_name
    create_synthetic_crack_image(img2_path, width=800, height=600, crack_intensity=1.35, seed=101)
    res2 = detect_cracks_classical(img2_path, Config.OVERLAY_FOLDER, Config.MASK_FOLDER)

    insp2 = Inspection(
        building_id=b1.id,
        user_id=demo_user.id,
        inspection_date=now - datetime.timedelta(days=5),
        surface_type="Beam Surface",
        location="Podium Level 2, Column B4 Joint",
        notes="Quarterly follow-up inspection. Visual elongation observed along horizontal trajectory.",
        original_image_path=img2_name,
        overlay_image_path=res2.overlay_path,
        mask_image_path=res2.mask_path,
        detection_method=res2.detection_method,
        model_version=res2.model_version,
        image_width=res2.width,
        image_height=res2.height,
        detected_pixel_area=res2.detected_pixel_area,
        detected_pixel_percentage=res2.detected_pixel_percentage,
        region_count=res2.region_count,
        calibration_factor=0.25,
        processing_duration_ms=res2.processing_duration_ms,
        review_status="requires_qualified_review",
        reviewer_notes="Detected crack area increased. Recommend physical tell-tale displacement gauge installation.",
        warnings=res2.warnings,
    )
    insp2.regions_data = res2.regions_data

    # Building 2 - Inspection (Infrastructure pier)
    img3_name = "sample_b2_t1.jpg"
    img3_path = Config.UPLOAD_FOLDER / img3_name
    create_synthetic_crack_image(img3_path, width=800, height=600, crack_intensity=1.8, seed=202)
    res3 = detect_cracks_classical(img3_path, Config.OVERLAY_FOLDER, Config.MASK_FOLDER)

    insp3 = Inspection(
        building_id=b2.id,
        user_id=demo_user.id,
        inspection_date=now - datetime.timedelta(days=12),
        surface_type="Column Surface",
        location="Pier Column 4B - Splash Zone",
        notes="Annual monsoon post-flood inspection. Longitudinal crack pattern detected along vertical rebar alignment.",
        original_image_path=img3_name,
        overlay_image_path=res3.overlay_path,
        mask_image_path=res3.mask_path,
        detection_method=res3.detection_method,
        model_version=res3.model_version,
        image_width=res3.width,
        image_height=res3.height,
        detected_pixel_area=res3.detected_pixel_area,
        detected_pixel_percentage=res3.detected_pixel_percentage,
        region_count=res3.region_count,
        calibration_factor=0.3,
        processing_duration_ms=res3.processing_duration_ms,
        review_status="requires_qualified_review",
        reviewer_notes="Potential rebar corrosion-induced spalling crack. Non-destructive acoustic sounding recommended.",
        warnings=res3.warnings,
    )
    insp3.regions_data = res3.regions_data

    db.session.add_all([insp1, insp2, insp3])
    db.session.commit()

    # Create Comparison between insp1 and insp2
    comp_res = align_and_compare_inspections(
        earlier_image_path=img1_path,
        later_image_path=img2_path,
        earlier_mask_path=Config.MASK_FOLDER / res1.mask_path,
        later_mask_path=Config.MASK_FOLDER / res2.mask_path,
        output_diff_dir=Config.DIFF_FOLDER,
        earlier_pct=res1.detected_pixel_percentage,
        later_pct=res2.detected_pixel_percentage,
    )

    comp = Comparison(
        user_id=demo_user.id,
        building_id=b1.id,
        earlier_inspection_id=insp1.id,
        later_inspection_id=insp2.id,
        percentage_point_diff=comp_res["percentagePointDiff"],
        relative_percentage_change=comp_res["relativePercentageChange"],
        alignment_score=comp_res["alignmentScore"],
        diff_image_path=comp_res["diffImagePath"],
        notes="Longitudinal tracking over 55 days indicates elongation of primary fissure branch.",
    )
    db.session.add(comp)

    # Add Initial Notifications
    n1 = Notification(
        user_id=demo_user.id,
        title="Follow-Up Review Advised",
        message="Metro Tower Complex Column B4 exhibited +0.28 percentage-point increase in detected crack area.",
        notification_type="review_alert",
        link=f"/inspections/{insp2.id}",
    )
    n2 = Notification(
        user_id=demo_user.id,
        title="Inspection Analysis Completed",
        message="Riverside Viaduct Pier 4 inspection successfully processed via Classical CV pipeline.",
        notification_type="success",
        link=f"/inspections/{insp3.id}",
    )
    db.session.add_all([n1, n2])
    db.session.commit()

    return demo_user
