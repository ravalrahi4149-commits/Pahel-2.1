from flask import Blueprint, jsonify, g
from app.database import db
from app.models.notification import Notification
from app.services.auth_helper import login_required

notifications_bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")

@notifications_bp.route("", methods=["GET"])
@login_required
def list_notifications():
    user = g.current_user
    notifs = (
        Notification.query.filter_by(user_id=user.id)
        .order_by(Notification.created_at.desc())
        .limit(30)
        .all()
    )
    unread_count = Notification.query.filter_by(user_id=user.id, is_read=False).count()
    return jsonify({
        "notifications": [n.to_dict() for n in notifs],
        "unreadCount": unread_count,
    })


@notifications_bp.route("/<int:notif_id>/read", methods=["PUT"])
@login_required
def mark_as_read(notif_id):
    notif = Notification.query.get_or_404(notif_id)
    if notif.user_id != g.current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    notif.is_read = True
    db.session.commit()
    return jsonify({"message": "Notification marked as read."})


@notifications_bp.route("/read-all", methods=["PUT"])
@login_required
def mark_all_read():
    user = g.current_user
    Notification.query.filter_by(user_id=user.id, is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"message": "All notifications marked as read."})


@notifications_bp.route("/<int:notif_id>", methods=["DELETE"])
@login_required
def dismiss_notification(notif_id):
    notif = Notification.query.get_or_404(notif_id)
    if notif.user_id != g.current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(notif)
    db.session.commit()
    return jsonify({"message": "Notification dismissed."})
