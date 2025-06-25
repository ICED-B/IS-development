from flask.views import MethodView
from flask import jsonify
from flask_wtf.csrf import generate_csrf
from flask_smorest import Blueprint

csrf_blp = Blueprint("csrf", __name__, url_prefix="/api/v1")


@csrf_blp.route("/csrf", methods=["GET"])
class CsrfTokenResource(MethodView):
    @csrf_blp.response(200)
    def get(self):
        csrf_token = generate_csrf()
        return jsonify({"csrf_token": csrf_token})
