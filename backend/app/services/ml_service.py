import os
import time
import uuid
from pathlib import Path
from PIL import Image
import numpy as np

from app.config import Config
from app.services.cv_service import (
    CrackDetectionResult,
    detect_cracks_classical,
    _generate_annotated_overlay,
)

# Check PyTorch availability
try:
    import torch
    import torch.nn as nn
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False


if HAS_TORCH:
    class DoubleConv(nn.Module):
        def __init__(self, in_channels, out_channels):
            super().__init__()
            self.net = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1, bias=False),
                nn.BatchNorm2d(out_channels),
                nn.ReLU(inplace=True),
                nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1, bias=False),
                nn.BatchNorm2d(out_channels),
                nn.ReLU(inplace=True),
            )

        def forward(self, x):
            return self.net(x)

    class UNet(nn.Module):
        """Standard U-Net architecture for crack semantic segmentation."""
        def __init__(self, in_channels=3, out_channels=1):
            super().__init__()
            self.inc = DoubleConv(in_channels, 64)
            self.down1 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(64, 128))
            self.down2 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(128, 256))
            self.down3 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(256, 512))
            
            self.up1 = nn.ConvTranspose2d(512, 256, kernel_size=2, stride=2)
            self.conv1 = DoubleConv(512, 256)
            
            self.up2 = nn.ConvTranspose2d(256, 128, kernel_size=2, stride=2)
            self.conv2 = DoubleConv(256, 128)
            
            self.up3 = nn.ConvTranspose2d(128, 64, kernel_size=2, stride=2)
            self.conv3 = DoubleConv(128, 64)
            
            self.outc = nn.Conv2d(64, out_channels, kernel_size=1)

        def forward(self, x):
            x1 = self.inc(x)
            x2 = self.down1(x1)
            x3 = self.down2(x2)
            x4 = self.down3(x3)
            
            x = self.up1(x4)
            x = self.conv1(torch.cat([x, x3], dim=1))
            
            x = self.up2(x)
            x = self.conv2(torch.cat([x, x2], dim=1))
            
            x = self.up3(x)
            x = self.conv3(torch.cat([x, x1], dim=1))
            
            logits = self.outc(x)
            return logits


def detect_cracks(
    image_path: Path,
    output_overlay_dir: Path,
    output_mask_dir: Path,
    preferred_mode: str = "auto",
) -> CrackDetectionResult:
    """
    Modular crack detection dispatcher.
    - If preferred_mode == 'ml' or 'auto', checks if model weights exist at UNET_WEIGHTS_PATH.
    - If weights exist, runs real U-Net inference.
    - If weights do NOT exist or mode == 'cv', runs classical CV pipeline with honest attribution.
    """
    weights_path = Path(Config.UNET_WEIGHTS_PATH)
    can_run_ml = (
        HAS_TORCH
        and preferred_mode in ["auto", "ml"]
        and weights_path.exists()
        and weights_path.is_file()
    )

    if not can_run_ml:
        result = detect_cracks_classical(
            image_path=image_path,
            output_overlay_dir=output_overlay_dir,
            output_mask_dir=output_mask_dir,
        )
        if preferred_mode == "ml":
            result.warnings.insert(
                0,
                "Learned U-Net weights file not found on server; safely fell back to classical computer vision baseline.",
            )
        return result

    # Mode B: Run PyTorch U-Net Inference
    start_time = time.time()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    try:
        model = UNet(in_channels=3, out_channels=1)
        checkpoint = torch.load(weights_path, map_location=device)
        if "model_state_dict" in checkpoint:
            model.load_state_dict(checkpoint["model_state_dict"])
        else:
            model.load_state_dict(checkpoint)
        model.to(device)
        model.eval()

        with Image.open(image_path) as img:
            img_rgb = img.convert("RGB")
            orig_w, orig_h = img_rgb.size
            # Preprocess to 512x512
            resized = img_rgb.resize((512, 512), Image.BILINEAR)
            arr = np.array(resized, dtype=np.float32) / 255.0
            arr = np.transpose(arr, (2, 0, 1))  # (3, 512, 512)
            tensor_in = torch.from_numpy(arr).unsqueeze(0).to(device)

        with torch.no_grad():
            output = model(tensor_in)
            probs = torch.sigmoid(output).squeeze().cpu().numpy()

        # Binary threshold at 0.5
        mask_512 = (probs > 0.5).astype(np.uint8) * 255
        mask_pil = Image.fromarray(mask_512, mode="L").resize(
            (orig_w, orig_h), Image.NEAREST
        )
        binary_mask = np.array(mask_pil, dtype=np.uint8)

        # Region stats
        detected_pixel_area = int(np.sum(binary_mask > 0))
        total_pixels = orig_w * orig_h
        detected_pixel_percentage = (detected_pixel_area / total_pixels) * 100.0

        mask_filename = f"mask_ml_{uuid.uuid4().hex[:12]}.png"
        mask_file_path = output_mask_dir / mask_filename
        mask_pil.save(mask_file_path, "PNG")

        overlay_filename = f"overlay_ml_{uuid.uuid4().hex[:12]}.png"
        overlay_file_path = output_overlay_dir / overlay_filename
        
        # Calculate regions roughly
        regions_data = [
            {
                "id": 1,
                "bbox": [0, 0, orig_w, orig_h],
                "area": detected_pixel_area,
                "approxLengthPx": round(np.sqrt(detected_pixel_area), 1),
                "centroid": [orig_w / 2, orig_h / 2],
            }
        ] if detected_pixel_area > 0 else []

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
            width=orig_w,
            height=orig_h,
            detected_pixel_area=detected_pixel_area,
            detected_pixel_percentage=detected_pixel_percentage,
            region_count=len(regions_data),
            regions_data=regions_data,
            processing_duration_ms=duration_ms,
            detection_method=f"PyTorch U-Net Semantic Segmentation ({device})",
            model_version="v2.0-unet-weights",
            warnings=[
                "AI segmentation model inference completed.",
                "Observations require human verification by a licensed civil or structural engineer.",
            ],
        )

    except Exception as e:
        # Honest fallback if model fails
        result = detect_cracks_classical(
            image_path=image_path,
            output_overlay_dir=output_overlay_dir,
            output_mask_dir=output_mask_dir,
        )
        result.warnings.insert(
            0,
            f"PyTorch inference encountered an error ({str(e)}); fallen back safely to classical CV baseline.",
        )
        return result
