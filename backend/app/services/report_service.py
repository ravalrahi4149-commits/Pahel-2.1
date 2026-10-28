import csv
import io
import uuid
from datetime import datetime
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image as RLImage,
    KeepTogether,
    HRFlowable,
)

from app.config import Config

def generate_inspection_pdf(inspection, building, inspector) -> Path:
    """
    Generates an official CrackLife AI inspection engineering report in PDF format.
    """
    report_filename = f"report_insp_{inspection.id}_{uuid.uuid4().hex[:8]}.pdf"
    output_path = Config.REPORT_FOLDER / report_filename

    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=20,
        textColor=colors.HexColor("#0B192C"),
        spaceAfter=4,
    )
    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        textColor=colors.HexColor("#475569"),
        spaceAfter=14,
    )
    section_title = ParagraphStyle(
        "SectionTitle",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        textColor=colors.HexColor("#1E293B"),
        spaceBefore=10,
        spaceAfter=6,
    )
    body_style = ParagraphStyle(
        "ReportBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        textColor=colors.HexColor("#334155"),
        leading=12,
    )
    disclaimer_style = ParagraphStyle(
        "Disclaimer",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=7.5,
        textColor=colors.HexColor("#64748B"),
        leading=10,
    )

    story = []

    # 1. Header Banner
    header_data = [
        [
            Paragraph("<b>CRACKLIFE AI</b><br/><font size=8 color='#0284C7'>CRACK DETECTION & MONITORING PLATFORM</font>", title_style),
            Paragraph(f"<b>REPORT ID:</b> CL-INS-{inspection.id:05d}<br/><b>GENERATED:</b> {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}<br/><b>STATUS:</b> {inspection.review_status.upper().replace('_', ' ')}", body_style),
        ]
    ]
    header_table = Table(header_data, colWidths=[330, 200])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0EA5E9"), spaceAfter=14))

    # 2. Building & Inspection Overview Table
    story.append(Paragraph("1. Structural Asset & Inspection Details", section_title))
    overview_data = [
        ["Building Name:", building.name, "Surface Type:", inspection.surface_type],
        ["Building ID:", building.identifier, "Location / Room:", inspection.location],
        ["Address:", building.address, "Inspection Date:", inspection.inspection_date.strftime('%Y-%m-%d %H:%M') if inspection.inspection_date else "N/A"],
        ["Asset Type:", f"{building.building_type} ({building.floors} floors)", "Lead Inspector:", inspector.full_name if inspector else "Engineering Staff"],
    ]
    overview_table = Table(overview_data, colWidths=[90, 180, 100, 160])
    overview_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor("#1E293B")),
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('FONTNAME', (2,0), (2,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(overview_table)
    story.append(Spacer(1, 12))

    # 3. Quantitative Measurements Table
    story.append(Paragraph("2. Computer Vision Analysis Findings", section_title))
    meas_data = [
        ["Metric", "Value", "Notes / Interpretation"],
        ["Detection Pipeline", inspection.detection_method, inspection.model_version],
        ["Image Dimensions", f"{inspection.image_width} × {inspection.image_height} px", f"Total: {inspection.image_width * inspection.image_height:,} px"],
        ["Detected Crack Area", f"{inspection.detected_pixel_area:,} px", f"{inspection.detected_pixel_percentage:.3f}% of surface image"],
        ["Candidate Crack Regions", f"{inspection.region_count} distinct regions", "Segmented contiguous pixel clusters"],
        ["Processing Latency", f"{inspection.processing_duration_ms} ms", "On-premise inference duration"],
        ["Scale Calibration", f"{inspection.calibration_factor} mm/px" if inspection.calibration_factor else "Uncalibrated", "Estimated physical area available only if calibrated"],
    ]
    meas_table = Table(meas_data, colWidths=[140, 150, 240])
    meas_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0B192C")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F1F5F9")]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(meas_table)
    story.append(Spacer(1, 14))

    # 4. Inspection Photographs (Side-by-side or paired)
    story.append(Paragraph("3. Visual Evidence & Annotated Overlay", section_title))
    
    img_cells = []
    orig_path = Config.UPLOAD_FOLDER / inspection.original_image_path if inspection.original_image_path else None
    over_path = Config.OVERLAY_FOLDER / inspection.overlay_image_path if inspection.overlay_image_path else None

    if orig_path and orig_path.exists() and over_path and over_path.exists():
        img_cells = [
            [
                RLImage(str(orig_path), width=250, height=170),
                RLImage(str(over_path), width=250, height=170),
            ],
            [
                Paragraph("<b>Figure A:</b> Original Surface Photograph", body_style),
                Paragraph("<b>Figure B:</b> CrackLife AI Segmented Overlay", body_style),
            ]
        ]
        img_table = Table(img_cells, colWidths=[265, 265])
        img_table.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(KeepTogether(img_table))

    story.append(Spacer(1, 12))

    # 5. Inspector Notes & Review Status
    story.append(Paragraph("4. Field Observations & Engineering Review", section_title))
    notes_content = inspection.notes or "No field remarks submitted."
    rev_notes = inspection.reviewer_notes or "Pending formal review by licensed structural engineer."
    review_data = [
        ["Field Notes:", Paragraph(notes_content, body_style)],
        ["Engineering Assessment:", Paragraph(rev_notes, body_style)],
    ]
    review_table = Table(review_data, colWidths=[120, 410])
    review_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(review_table)
    story.append(Spacer(1, 14))

    # 6. Quality Warnings
    if inspection.warnings_list:
        story.append(Paragraph("5. Quality & Image Capture Disclosures", section_title))
        for w in inspection.warnings_list:
            story.append(Paragraph(f"• {w}", body_style))
        story.append(Spacer(1, 10))

    # 7. Civil Engineering Responsible AI Disclaimer
    story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#94A3B8"), spaceBefore=10, spaceAfter=8))
    disclaimer_text = (
        "<b>LEGAL & PROFESSIONAL NOTICE:</b> CrackLife AI is an artificial intelligence-assisted surface inspection documentation "
        "and longitudinal monitoring software tool. Image segmentation detects surface pixel irregularities and does NOT constitute "
        "a structural integrity assessment, load-bearing diagnosis, or building safety certification. Factors including illumination, "
        "shadows, camera resolution, angle of incidence, and focal distance directly affect pixel-level readings. Definitive decisions "
        "regarding structural safety, remedial interventions, or occupancy must be conducted by certified civil/structural engineers."
    )
    story.append(Paragraph(disclaimer_text, disclaimer_style))

    doc.build(story)
    return output_path


def generate_inspections_csv(inspections) -> str:
    """Generates a CSV string containing historical inspection records."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Inspection ID",
        "Building ID",
        "Building Name",
        "Date",
        "Surface Type",
        "Location",
        "Detected Pixel Area",
        "Detected Pixel Percentage",
        "Region Count",
        "Review Status",
        "Detection Method",
    ])
    for insp in inspections:
        writer.writerow([
            insp.id,
            insp.building_id,
            insp.building.name if insp.building else "N/A",
            insp.inspection_date.strftime("%Y-%m-%d %H:%M") if insp.inspection_date else "",
            insp.surface_type,
            insp.location,
            insp.detected_pixel_area,
            f"{insp.detected_pixel_percentage:.3f}%",
            insp.region_count,
            insp.review_status,
            insp.detection_method,
        ])
    return output.getvalue()
