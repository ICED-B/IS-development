from flask import Flask
from flask_smorest import Api
from flask_jwt_extended import JWTManager
from flask_jwt_extended import get_jwt
from flask_cors import CORS
from .config import config_by_name
from .db import db, migrate
import os
from .models import Pracovnici, Specializace, Produkty, Zakaznici, Rezervace, Schuzky
from .api.routes import blueprints  # <- nový způsob importu všech rout
from .models.token_blacklist import TokenBlacklist
from flask_cors import CORS

jwt = JWTManager()


def create_app(config_name=None, config_override=None):
    if config_name is None:
        config_name = os.getenv("FLASK_CONFIG", "default")

    app = Flask(__name__)
    CORS(app, origins=["http://127.0.0.1:5173"], supports_credentials=True)
    # CORS(app, resources={r"/api/*": {"origins": "*"}})

    if config_override:
        app.config.from_object(config_override)
    else:
        app.config.from_object(config_by_name[config_name])

    # Inicializace databáze a migrací
    db.init_app(app)
    migrate.init_app(app, db)

    # Inicializace JWT
    jwt.init_app(app)

    # Kontrola blacklistu tokenů
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload["jti"]
        token = TokenBlacklist.query.filter_by(jti=jti).first()
        return token is not None  # True = zablokovaný token

    # Inicializace Flask-Smorest API
    api = Api(app)
    api.spec.components.schema_name_resolver = lambda schema: schema.__class__.__name__

    # 🔐 JWT autorizační schéma pro Swagger UI
    api.spec.components.security_scheme(
        "BearerAuth",
        {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    )
    api.spec.options["security"] = [{"BearerAuth": []}]

    # Registrace všech blueprintů (zakaznici, auth, produkty, atd.)
    for blp in blueprints:
        api.register_blueprint(blp)

    # Shell context pro Flask shell
    @app.shell_context_processor
    def make_shell_context():
        return {
            "db": db,
            "Pracovnici": Pracovnici,
            "Specializace": Specializace,
            "Produkty": Produkty,
            "Zakaznici": Zakaznici,
            "Rezervace": Rezervace,
            "Schuzky": Schuzky,
        }

    # Testovací route
    @app.route("/hello")
    def hello():
        return "Hello, World from Flask!"

    return app
