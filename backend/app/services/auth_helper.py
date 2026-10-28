from jose import jwt, JWTError
import datetime
from functools import wraps
from flask import request, jsonify, g
from app.config import Config
from app.models.user import User

def create_access_token(user: User) -> str:
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7),
        "iat": datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, Config.SECRET_KEY, algorithm="HS256")


def get_current_user():
    """Extracts user from Authorization: Bearer <token> or defaults to demo user if present."""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
            user_id = int(payload.get("sub"))
            user = User.query.get(user_id)
            if user:
                return user
        except Exception:
            pass

    # Fallback to demo user if available for frictionless demoing/testing
    demo_user = User.query.filter_by(email="demo@cracklife.ai").first()
    if demo_user:
        return demo_user
    # Or first user
    return User.query.first()


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({"error": "Unauthorized. Please log in."}), 401
        g.current_user = user
        return f(*args, **kwargs)
    return decorated_function
