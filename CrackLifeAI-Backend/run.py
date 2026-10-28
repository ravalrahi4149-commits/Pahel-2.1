import os
import sys
from pathlib import Path

# Forward execution to backend/
ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from run import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    host = os.environ.get("HOST", "0.0.0.0")
    debug = os.environ.get("DEBUG", "true").lower() == "true"
    print(f"🚀 CrackLife AI Backend running on http://localhost:{port}")
    app.run(host=host, port=port, debug=debug)
