from flask import Blueprint, request, jsonify, g
from app.database import db
from app.models.user import User
from app.services.auth_helper import create_access_token, login_required, get_current_user

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    full_name = data.get("fullName", "").strip()
    organization = data.get("organization", "Structural Diagnostics Lab")

    if not email or not password or not full_name:
        return jsonify({"error": "Email, password, and full name are required."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with this email address already exists."}), 409

    user = User(
        email=email,
        full_name=full_name,
        organization=organization,
        role="inspector",
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(user)
    return jsonify({
        "message": "User registered successfully.",
        "user": user.to_dict(),
        "token": token,
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password."}), 401

    token = create_access_token(user)
    return jsonify({
        "message": "Login successful.",
        "user": user.to_dict(),
        "token": token,
    })


@auth_bp.route("/profile", methods=["GET"])
@login_required
def get_profile():
    return jsonify({"user": g.current_user.to_dict()})


@auth_bp.route("/profile", methods=["PUT"])
@login_required
def update_profile():
    user = g.current_user
    data = request.get_json() or {}
    
    if "fullName" in data:
        user.full_name = data["fullName"].strip()
    if "organization" in data:
        user.organization = data["organization"].strip()
    if "languagePreference" in data:
        user.language_preference = data["languagePreference"]
    if "themePreference" in data:
        user.theme_preference = data["themePreference"]

    db.session.commit()
    return jsonify({"message": "Profile updated successfully.", "user": user.to_dict()})


@auth_bp.route("/change-password", methods=["POST"])
@login_required
def change_password():
    user = g.current_user
    data = request.get_json() or {}
    old_pw = data.get("oldPassword", "")
    new_pw = data.get("newPassword", "")

    if not user.check_password(old_pw):
        return jsonify({"error": "Incorrect current password."}), 400
    if len(new_pw) < 6:
        return jsonify({"error": "New password must be at least 6 characters."}), 400

    user.set_password(new_pw)
    db.session.commit()
    return jsonify({"message": "Password changed successfully."})
