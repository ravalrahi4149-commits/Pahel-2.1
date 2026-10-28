import os
from pathlib import Path
from flask import Blueprint, send_from_directory, abort, jsonify
from app.config import Config

media_bp = Blueprint("media", __name__, url_prefix="/api/media")

@media_bp.route("/image/<path:filename>")
def serve_image(filename):
    # Prevent path traversal attacks
    if ".." in filename or filename.startswith("/"):
        abort(400)

    # Search in uploads, overlays, masks, diffs
    search_dirs = [
        Config.OVERLAY_FOLDER,
        Config.UPLOAD_FOLDER,
        Config.MASK_FOLDER,
        Config.DIFF_FOLDER,
    ]

    for d in search_dirs:
        target = d / filename
        if target.exists() and target.is_file():
            return send_from_directory(str(d), filename)

    abort(404)
