import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "cracklife-ai-super-secret-key-2026")
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", f"sqlite:///{BASE_DIR / 'cracklife.db'}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Upload directories
    STORAGE_DIR = BASE_DIR / "storage"
    UPLOAD_FOLDER = STORAGE_DIR / "uploads"
    OVERLAY_FOLDER = STORAGE_DIR / "overlays"
    MASK_FOLDER = STORAGE_DIR / "masks"
    DIFF_FOLDER = STORAGE_DIR / "diffs"
    REPORT_FOLDER = STORAGE_DIR / "reports"
    MODELS_FOLDER = BASE_DIR / "models"
    
    MAX_CONTENT_LENGTH = 32 * 1024 * 1024  # 32MB max upload
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}
    
    # CORS
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")
    
    # Model configuration
    UNET_WEIGHTS_PATH = MODELS_FOLDER / "crack_segmentation_unet.pth"

    @classmethod
    def init_app(cls):
        for folder in [
            cls.STORAGE_DIR,
            cls.UPLOAD_FOLDER,
            cls.OVERLAY_FOLDER,
            cls.MASK_FOLDER,
            cls.DIFF_FOLDER,
            cls.REPORT_FOLDER,
            cls.MODELS_FOLDER,
        ]:
            folder.mkdir(parents=True, exist_ok=True)
