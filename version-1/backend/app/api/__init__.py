from flask_smorest import Blueprint

# Hlavní API Blueprint
api_v1_bp = Blueprint(
    "api_v1",
    __name__,
    url_prefix="/api/v1",
    description="API verze 1"
)
