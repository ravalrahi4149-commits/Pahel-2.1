from flask import Flask, jsonify
from flask_cors import CORS

from app.config import Config
from app.database import db, init_db

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize directories
    Config.init_app()

    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Initialize Database
    init_db(app)

    # Register Blueprints
    from app.routes.auth import auth_bp
    from app.routes.buildings import buildings_bp
    from app.routes.inspections import inspections_bp
    from app.routes.comparisons import comparisons_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.reports import reports_bp
    from app.routes.notifications import notifications_bp
    from app.routes.media import media_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(buildings_bp)
    app.register_blueprint(inspections_bp)
    app.register_blueprint(comparisons_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(media_bp)

    @app.route("/api/health")
    def health():
        return jsonify({
            "status": "healthy",
            "service": "CrackLife AI Backend",
            "version": "1.0.0",
        })

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found."}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": "Internal server error occurred."}), 500

    return app
