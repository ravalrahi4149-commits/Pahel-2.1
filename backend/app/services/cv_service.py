import math
import time
import uuid
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageEnhance
import numpy as np

# Try importing cv2 if available; otherwise use pure NumPy/PIL implementation
try:
    import cv2
    HAS_CV2 = True
except ImportError:
    HAS_CV2 = False

class CrackDetectionResult:
    def __init__(
        self,
        original_path: str,
        overlay_path: str,
        mask_path: str,
        width: int,
        height: int,
        detected_pixel_area: int,
        detected_pixel_percentage: float,
        region_count: int,
        regions_data: list,
        processing_duration_ms: int,
        detection_method: str,
        model_version: str,
        warnings: list,
    ):
        self.original_path = original_path
        self.overlay_path = overlay_path
        self.mask_path = mask_path
        self.width = width
        self.height = height
        self.detected_pixel_area = detected_pixel_area
        self.detected_pixel_percentage = detected_pixel_percentage
        self.region_count = region_count
        self.regions_data = regions_data
        self.processing_duration_ms = processing_duration_ms
        self.detection_method = detection_method
        self.model_version = model_version
        self.warnings = warnings


def detect_cracks_classical(
    image_path: Path,
    output_overlay_dir: Path,
    output_mask_dir: Path,
    min_region_pixels: int = 25,
) -> CrackDetectionResult:
    """
    Performs classical computer vision crack detection on the input image.
    Uses OpenCV if available; otherwise falls back to pure NumPy + Pillow image processing.
    """
    start_time = time.time()
    
    # 1. Open and validate image
    with Image.open(image_path) as img:
        img_rgb = img.convert("RGB")
        width, height = img_rgb.size
    
    warnings = []
    
    # 2. Quality checks
    gray_img = img_rgb.convert("L")
    stat_arr = np.array(gray_img, dtype=np.float32)
    mean_val = float(np.mean(stat_arr))
    std_val = float(np.std(stat_arr))
    
    if mean_val < 45.0:
        warnings.append("Low ambient illumination detected (underexposed image); segmentation sensitivity may be reduced.")
    elif mean_val > 220.0:
        warnings.append("High surface glare or overexposure detected; false positives may occur along reflections.")
    
    if std_val < 22.0:
        warnings.append("Low contrast surface detected; subtle hairline fissures may require supplementary oblique lighting.")

    warnings.append("Uncalibrated photograph: Measurements are expressed in pixel area. Physical mm require calibration marker.")

    # 3. Detection pipeline
    if HAS_CV2:
        binary_mask, regions_data = _detect_with_opencv(
            image_path, min_region_pixels=min_region_pixels
        )
        method_name = "Classical Computer Vision (OpenCV CLAHE & Adaptive Morphology)"
    else:
        binary_mask, regions_data = _detect_with_pillow_numpy(
            img_rgb, min_region_pixels=min_region_pixels
        )
        method_name = "Classical Computer Vision (NumPy/PIL Spatial Filtering)"

    # 4. Compute metrics
    detected_pixel_area = int(np.sum(binary_mask > 0))
    total_pixels = width * height
    detected_pixel_percentage = (detected_pixel_area / total_pixels) * 100.0 if total_pixels > 0 else 0.0
    region_count = len(regions_data)

    # 5. Save binary mask image
    mask_filename = f"mask_{uuid.uuid4().hex[:12]}.png"
    mask_file_path = output_mask_dir / mask_filename
    mask_img = Image.fromarray((binary_mask > 0).astype(np.uint8) * 255, mode="L")
    mask_img.save(mask_file_path, "PNG")

    # 6. Generate color-annotated overlay image
    overlay_filename = f"overlay_{uuid.uuid4().hex[:12]}.png"
    overlay_file_path = output_overlay_dir / overlay_filename
    _generate_annotated_overlay(
        original_img=img_rgb,
        binary_mask=binary_mask,
        regions_data=regions_data,
        output_path=overlay_file_path,
        detected_pct=detected_pixel_percentage,
    )

    duration_ms = int((time.time() - start_time) * 1000)

    return CrackDetectionResult(
        original_path=image_path.name,
        overlay_path=overlay_filename,
        mask_path=mask_filename,
        width=width,
        height=height,
        detected_pixel_area=detected_pixel_area,
        detected_pixel_percentage=detected_pixel_percentage,
        region_count=region_count,
        regions_data=regions_data,
        processing_duration_ms=duration_ms,
        detection_method=method_name,
        model_version="v1.0-cv-baseline",
        warnings=warnings,
    )


def _detect_with_opencv(image_path: Path, min_region_pixels: int = 25):
    """OpenCV-accelerated pipeline."""
    img_bgr = cv2.imread(str(image_path))
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    
    # Noise reduction
    blurred = cv2.bilateralFilter(gray, 7, 50, 50)
    
    # Contrast Limited Adaptive Histogram Equalization
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
    enhanced = clahe.apply(blurred)
    
    # Adaptive thresholding
    thresh = cv2.adaptiveThreshold(
        enhanced, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 21, 5
    )
    
    # Morphological opening then closing
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    morphed = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)
    morphed = cv2.morphologyEx(morphed, cv2.MORPH_CLOSE, kernel, iterations=1)
    
    # Connected components
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(morphed, connectivity=8)
    
    clean_mask = np.zeros_like(morphed, dtype=np.uint8)
    regions = []
    
    for i in range(1, num_labels):
        area = int(stats[i, cv2.CC_STAT_AREA])
        w = int(stats[i, cv2.CC_STAT_WIDTH])
        h = int(stats[i, cv2.CC_STAT_HEIGHT])
        x = int(stats[i, cv2.CC_STAT_LEFT])
        y = int(stats[i, cv2.CC_STAT_TOP])
        
        # Filter noise & square blocks (cracks are typically elongated)
        aspect_ratio = max(w, h) / max(1, min(w, h))
        if area >= min_region_pixels and (aspect_ratio >= 1.3 or area >= 50):
            clean_mask[labels == i] = 255
            approx_length = round(math.sqrt(w**2 + h**2), 1)
            regions.append({
                "id": len(regions) + 1,
                "bbox": [x, y, w, h],
                "area": area,
                "approxLengthPx": approx_length,
                "centroid": [round(float(centroids[i][0]), 1), round(float(centroids[i][1]), 1)],
            })
            
    return clean_mask, regions


def _detect_with_pillow_numpy(img_rgb: Image.Image, min_region_pixels: int = 25):
    """Pure NumPy and Pillow crack segmentation pipeline."""
    gray = img_rgb.convert("L")
    
    # Contrast enhancement & local filtering
    enhancer = ImageEnhance.Contrast(gray)
    enhanced = enhancer.enhance(1.8)
    blurred = enhanced.filter(ImageFilter.GaussianBlur(radius=1.2))
    
    arr = np.array(blurred, dtype=np.float32)
    
    # Local mean subtraction for adaptive thresholding
    local_mean = np.array(blurred.filter(ImageFilter.BoxBlur(radius=10)), dtype=np.float32)
    diff = local_mean - arr
    
    # Cracks appear as darker troughs relative to local surroundings
    binary = (diff > 12.0).astype(np.uint8)
    
    # Simple morphological filtering using box dilation/erosion simulation
    h, w = binary.shape
    visited = np.zeros((h, w), dtype=bool)
    clean_mask = np.zeros((h, w), dtype=np.uint8)
    regions = []
    
    # Connected component analysis using 4-way BFS for contiguous components
    for r in range(0, h, 2):
        for c in range(0, w, 2):
            if binary[r, c] == 1 and not visited[r, c]:
                queue = [(r, c)]
                visited[r, c] = True
                component = []
                min_r, max_r = r, r
                min_c, max_c = c, c
                
                while queue:
                    cr, cc = queue.pop()
                    component.append((cr, cc))
                    min_r = min(min_r, cr)
                    max_r = max(max_r, cr)
                    min_c = min(min_c, cc)
                    max_c = max(max_c, cc)
                    
                    for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                        nr, nc = cr + dr, cc + dc
                        if 0 <= nr < h and 0 <= nc < w:
                            if binary[nr, nc] == 1 and not visited[nr, nc]:
                                visited[nr, nc] = True
                                queue.append((nr, nc))
                                
                area = len(component)
                bw = max_c - min_c + 1
                bh = max_r - min_r + 1
                aspect = max(bw, bh) / max(1, min(bw, bh))
                
                # Filter small salt-and-pepper noise
                if area >= min_region_pixels and (aspect >= 1.2 or area >= 45):
                    for pr, pc in component:
                        clean_mask[pr, pc] = 255
                    approx_len = round(math.sqrt(bw**2 + bh**2), 1)
                    regions.append({
                        "id": len(regions) + 1,
                        "bbox": [int(min_c), int(min_r), int(bw), int(bh)],
                        "area": area,
                        "approxLengthPx": approx_len,
                        "centroid": [round(float(min_c + bw / 2), 1), round(float(min_r + bh / 2), 1)],
                    })

    return clean_mask, regions


def _generate_annotated_overlay(
    original_img: Image.Image,
    binary_mask: np.ndarray,
    regions_data: list,
    output_path: Path,
    detected_pct: float,
):
    """
    Creates an engineering overlay image:
    1. Base photo with translucent cyan/blue crack highlight
    2. Bounding boxes around candidate regions
    3. HUD label showing region counts and detected area %
    """
    overlay = original_img.copy().convert("RGBA")
    w, h = overlay.size

    # Color highlight layer: Electric cyan / teal crack overlay
    color_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    color_draw = ImageDraw.Draw(color_layer)
    
    # Create RGBA array for high performance
    highlight_pixels = np.zeros((h, w, 4), dtype=np.uint8)
    mask_indices = binary_mask > 0
    
    # Electric cyan color: R=6, G=182, B=212, A=180
    highlight_pixels[mask_indices] = [6, 182, 212, 200]
    crack_overlay_img = Image.fromarray(highlight_pixels, mode="RGBA")
    
    # Composite crack pixels onto base
    overlay = Image.alpha_composite(overlay, crack_overlay_img)
    draw = ImageDraw.Draw(overlay)

    # Draw bounding boxes for significant candidate regions
    for reg in regions_data[:25]:  # limit to top 25 regions to prevent visual clutter
        bbox = reg["bbox"]
        bx, by, bw, bh = bbox
        # Draw bounding rectangle in bright amber
        draw.rectangle(
            [bx, by, bx + bw, by + bh],
            outline=(245, 158, 11, 220),
            width=2,
        )
        # Label with region ID
        draw.text((bx + 3, max(0, by - 12)), f"R{reg['id']}", fill=(245, 158, 11, 240))

    # Convert back to RGB and save
    final_img = overlay.convert("RGB")
    final_img.save(output_path, "PNG")
