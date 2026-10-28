"""
CrackLife AI — Semantic Segmentation Model Training & Evaluation Pipeline (Mode C)
==================================================================================

This module provides a reproducible training workflow for fine-tuning a U-Net
architecture on crack segmentation datasets (e.g., DeepCrack, CrackTree, or custom datasets).

Directory structure convention:
  data/
    train/
      images/    # *.jpg / *.png RGB surface photographs
      masks/     # *.png binary masks (0=background, 255=crack)
    val/
      images/
      masks/

Metrics computed:
  - Precision: TP / (TP + FP)
  - Recall:    TP / (TP + FN)
  - IoU (Jaccard Index): TP / (TP + FP + FN)
  - Dice Score (F1):     2 * TP / (2 * TP + FP + FN)
"""

import os
import random
from pathlib import Path
import numpy as np
from PIL import Image

# Check torch availability
try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    from torch.utils.data import Dataset, DataLoader
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False


def set_seed(seed: int = 42):
    random.seed(seed)
    np.random.seed(seed)
    if HAS_TORCH:
        torch.manual_seed(seed)
        if torch.cuda.is_available():
            torch.cuda.manual_seed_all(seed)


if HAS_TORCH:
    class CrackDataset(Dataset):
        def __init__(self, images_dir: Path, masks_dir: Path, target_size=(512, 512), augment=False):
            self.images_dir = Path(images_dir)
            self.masks_dir = Path(masks_dir)
            self.target_size = target_size
            self.augment = augment

            self.image_files = sorted(list(self.images_dir.glob("*.jpg")) + list(self.images_dir.glob("*.png")))

        def __len__(self):
            return len(self.image_files)

        def __getitem__(self, idx):
            img_path = self.image_files[idx]
            mask_path = self.masks_dir / (img_path.stem + ".png")

            with Image.open(img_path) as img:
                img_rgb = img.convert("RGB").resize(self.target_size, Image.BILINEAR)
            
            if mask_path.exists():
                with Image.open(mask_path) as m:
                    mask_l = m.convert("L").resize(self.target_size, Image.NEAREST)
            else:
                mask_l = Image.new("L", self.target_size, 0)

            # Random augmentations: horizontal flip, vertical flip
            if self.augment:
                if random.random() > 0.5:
                    img_rgb = img_rgb.transpose(Image.FLIP_LEFT_RIGHT)
                    mask_l = mask_l.transpose(Image.FLIP_LEFT_RIGHT)
                if random.random() > 0.5:
                    img_rgb = img_rgb.transpose(Image.FLIP_TOP_BOTTOM)
                    mask_l = mask_l.transpose(Image.FLIP_TOP_BOTTOM)

            # Normalize to [0, 1]
            img_arr = np.array(img_rgb, dtype=np.float32) / 255.0
            mask_arr = (np.array(mask_l, dtype=np.float32) > 128.0).astype(np.float32)

            img_tensor = torch.from_numpy(img_arr.transpose(2, 0, 1))
            mask_tensor = torch.from_numpy(mask_arr).unsqueeze(0)

            return img_tensor, mask_tensor


    class DiceBCELoss(nn.Module):
        """Combined Binary Cross-Entropy and Dice Loss to handle severe class imbalance."""
        def __init__(self, bce_weight=0.5, smooth=1.0):
            super().__init__()
            self.bce = nn.BCEWithLogitsLoss()
            self.bce_weight = bce_weight
            self.smooth = smooth

        def forward(self, logits, targets):
            bce_loss = self.bce(logits, targets)
            probs = torch.sigmoid(logits)
            
            probs_flat = probs.view(-1)
            targets_flat = targets.view(-1)
            
            intersection = (probs_flat * targets_flat).sum()
            dice_loss = 1.0 - (2.0 * intersection + self.smooth) / (
                probs_flat.sum() + targets_flat.sum() + self.smooth
            )
            return self.bce_weight * bce_loss + (1.0 - self.bce_weight) * dice_loss


    def compute_metrics(preds_binary, targets):
        """Computes Precision, Recall, IoU, and Dice score."""
        p_flat = preds_binary.view(-1)
        t_flat = targets.view(-1)

        tp = (p_flat * t_flat).sum().item()
        fp = (p_flat * (1.0 - t_flat)).sum().item()
        fn = ((1.0 - p_flat) * t_flat).sum().item()

        precision = tp / (tp + fp + 1e-7)
        recall = tp / (tp + fn + 1e-7)
        iou = tp / (tp + fp + fn + 1e-7)
        dice = 2.0 * tp / (2.0 * tp + fp + fn + 1e-7)

        return {"precision": precision, "recall": recall, "iou": iou, "dice": dice}


def train_model(
    data_dir: str = "data",
    epochs: int = 25,
    batch_size: int = 4,
    learning_rate: float = 1e-4,
    checkpoint_dir: str = "models",
):
    """Executes model training or logs instructions if dataset is pending."""
    set_seed(42)
    if not HAS_TORCH:
        print("[Notice] PyTorch is required for model training. Run: pip install torch torchvision")
        return

    from app.services.ml_service import UNet

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"CrackLife AI Trainer | Hardware acceleration: {device}")

    data_path = Path(data_dir)
    train_images = data_path / "train" / "images"
    train_masks = data_path / "train" / "masks"

    if not train_images.exists() or len(list(train_images.glob("*.*"))) == 0:
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("Mode C: Model Training Instructions & Ready State")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("1. Place your training images in: data/train/images/")
        print("2. Place paired binary masks in:  data/train/masks/")
        print("3. Execute: python train_segmentation.py")
        print("4. Saved checkpoint 'crack_segmentation_unet.pth' will automatically")
        print("   enable Mode B (Learned PyTorch Inference) in the backend.")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        return

    train_ds = CrackDataset(train_images, train_masks, augment=True)
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)

    model = UNet(in_channels=3, out_channels=1).to(device)
    criterion = DiceBCELoss()
    optimizer = optim.AdamW(model.parameters(), lr=learning_rate, weight_decay=1e-4)

    print(f"Starting training on {len(train_ds)} image-mask pairs...")
    best_loss = float("inf")

    Path(checkpoint_dir).mkdir(parents=True, exist_ok=True)
    checkpoint_path = Path(checkpoint_dir) / "crack_segmentation_unet.pth"

    for epoch in range(1, epochs + 1):
        model.train()
        running_loss = 0.0
        for images, masks in train_loader:
            images = images.to(device)
            masks = masks.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, masks)
            loss.backward()
            optimizer.step()

            running_loss += loss.item()

        epoch_loss = running_loss / max(1, len(train_loader))
        print(f"Epoch [{epoch}/{epochs}] - Loss: {epoch_loss:.4f}")

        if epoch_loss < best_loss:
            best_loss = epoch_loss
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "loss": best_loss,
            }, checkpoint_path)
            print(f"✓ Saved optimal checkpoint to {checkpoint_path}")

    print("Training complete.")


if __name__ == "__main__":
    train_model()
