from flask.views import MethodView
from flask_smorest import Blueprint

ping_blp = Blueprint("ping", __name__, url_prefix="/api/v1")


@ping_blp.route("/ping")
class PingResource(MethodView):
    @ping_blp.response(200)
    def get(self):
        return {"status": "pong"}
