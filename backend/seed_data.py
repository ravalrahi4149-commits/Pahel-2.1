import sys
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from app import create_app
from app.services.seed_service import seed_database

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        user = seed_database()
        print(f"[OK] Seed complete! Demo account created: {user.email}")
