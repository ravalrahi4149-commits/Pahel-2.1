import uuid
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageEnhance
import numpy as np

def align_and_compare_inspections(
    earlier_image_path: Path,
    later_image_path: Path,
    earlier_mask_path: Path,
    later_mask_path: Path,
    output_diff_dir: Path,
    earlier_pct: float,
    later_pct: float,
):
    """
    Performs image alignment analysis, mask diffing, and change calculation.
    
    Formulas:
    Percentage-point difference = later detected area percentage - earlier detected area percentage
    Relative percentage change = (percentage-point difference / earlier detected area percentage) * 100
    """
    # 1. Exact mathematical metrics
    percentage_point_diff = later_pct - earlier_pct
    if earlier_pct > 0.0001:
        relative_percentage_change = (percentage_point_diff / earlier_pct) * 100.0
    else:
        relative_percentage_change = None

    # 2. Image loading and registration
    with Image.open(earlier_image_path) as e_img, Image.open(later_image_path) as l_img:
        e_rgb = e_img.convert("RGB")
        l_rgb = l_img.convert("RGB")
        
        target_size = (800, 600)
        e_resized = e_rgb.resize(target_size, Image.BILINEAR)
        l_resized = l_rgb.resize(target_size, Image.BILINEAR)

    # 3. Calculate alignment score using normalized cross-correlation / structural similarity approximation
    e_arr = np.array(e_resized.convert("L"), dtype=np.float32)
    l_arr = np.array(l_resized.convert("L"), dtype=np.float32)

    e_norm = (e_arr - np.mean(e_arr)) / (np.std(e_arr) + 1e-6)
    l_norm = (l_arr - np.mean(l_arr)) / (np.std(l_arr) + 1e-6)
    corr = float(np.mean(e_norm * l_norm))
    # Map correlation (-1 to 1) to alignment score (0 to 100%)
    alignment_score = max(0.0, min(100.0, (corr + 1.0) * 50.0))

    # 4. Generate visual difference map
    # Load masks if present
    e_mask_arr = np.zeros((600, 800), dtype=np.uint8)
    l_mask_arr = np.zeros((600, 800), dtype=np.uint8)
    
    if earlier_mask_path and earlier_mask_path.exists():
        with Image.open(earlier_mask_path) as m1:
            e_mask_arr = np.array(m1.convert("L").resize(target_size, Image.NEAREST)) > 0
    if later_mask_path and later_mask_path.exists():
        with Image.open(later_mask_path) as m2:
            l_mask_arr = np.array(m2.convert("L").resize(target_size, Image.NEAREST)) > 0

    # Diff overlay on later inspection
    diff_base = l_resized.copy().convert("RGBA")
    diff_layer = np.zeros((600, 800, 4), dtype=np.uint8)

    # Stable crack regions (present in both): Cyan [6, 182, 212, 180]
    stable_cracks = e_mask_arr & l_mask_arr
    diff_layer[stable_cracks] = [6, 182, 212, 180]

    # New / expanded crack regions (in later, not earlier): High-visibility Crimson/Amber [239, 68, 68, 220]
    expanded_cracks = (~e_mask_arr) & l_mask_arr
    diff_layer[expanded_cracks] = [239, 68, 68, 220]

    # Retracted or obscured regions (in earlier, not later): Slate gray [148, 163, 184, 150]
    retracted_regions = e_mask_arr & (~l_mask_arr)
    diff_layer[retracted_regions] = [148, 163, 184, 150]

    diff_layer_pil = Image.fromarray(diff_layer, mode="RGBA")
    diff_composite = Image.alpha_composite(diff_base, diff_layer_pil).convert("RGB")

    # Add HUD bar
    draw = ImageDraw.Draw(diff_composite)
    draw.rectangle([0, 0, 800, 28], fill=(15, 23, 42))
    change_text = f"Delta: {percentage_point_diff:+.2f}% pts"
    if relative_percentage_change is not None:
        change_text += f" ({relative_percentage_change:+.1f}% rel)"
    hud_label = f"CrackLife AI Diff | {change_text} | Alignment: {alignment_score:.1f}%"
    draw.text((12, 7), hud_label, fill=(241, 245, 249))

    diff_filename = f"diff_{uuid.uuid4().hex[:12]}.png"
    diff_path = output_diff_dir / diff_filename
    diff_composite.save(diff_path, "PNG")

    return {
        "percentagePointDiff": percentage_point_diff,
        "relativePercentageChange": relative_percentage_change,
        "alignmentScore": alignment_score,
        "diffImagePath": diff_filename,
    }
