import os
import sys

# Ensure UTF-8 console output on Windows
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from app import create_app
from app.services.seed_service import seed_database

app = create_app()

with app.app_context():
    try:
        seed_database()
        print("[OK] CrackLife AI database initialized and verified.")
    except Exception as e:
        print(f"Notice: Seed check completed with note: {e}")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    host = os.environ.get("HOST", "0.0.0.0")
    debug = os.environ.get("DEBUG", "false").lower() == "true"
    print(f"CrackLife AI Backend running on http://localhost:{port}")
    app.run(host=host, port=port, debug=debug)
