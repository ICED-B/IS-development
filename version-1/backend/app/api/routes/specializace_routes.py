from flask.views import MethodView
from flask_smorest import abort, Blueprint
from app.models import Specializace
from app.schemas import SpecializaceSchema, SpecializaceCreateSchema
from app.db import db
from app.utils.auth_decorator import access_control
from app.utils.enums import UserRoleEnum

specializace_blp = Blueprint("specializace", __name__, url_prefix="/api/v1/specializace")

@specializace_blp.route("/")
class SpecializaceResource(MethodView):
    @access_control(required_roles=[
        UserRoleEnum.ADMIN,
        UserRoleEnum.MAJITEL,
        UserRoleEnum.VEDOUCI,
        UserRoleEnum.PRACOVNIK
    ])
    @specializace_blp.response(200, SpecializaceSchema(many=True))
    def get(self):
        return Specializace.query.order_by(Specializace.nazev_specializace).all()

    @access_control(required_roles=[UserRoleEnum.ADMIN, UserRoleEnum.MAJITEL])
    @specializace_blp.arguments(SpecializaceCreateSchema)
    @specializace_blp.response(201, SpecializaceSchema)
    def post(self, specializace):
        try:
            db.session.add(specializace)
            db.session.commit()
            return specializace
        except Exception as e:
            print("CHYBA při vytváření specializace:", e)
            abort(500, message=str(e))

@specializace_blp.route("/<int:specializace_id>")
class SpecializaceDetailResource(MethodView):
    @access_control(required_roles=[
        UserRoleEnum.ADMIN,
        UserRoleEnum.MAJITEL,
        UserRoleEnum.VEDOUCI,
        UserRoleEnum.PRACOVNIK
    ])
    @specializace_blp.response(200, SpecializaceSchema)
    def get(self, specializace_id):
        specializace = db.session.get(Specializace, specializace_id)
        if not specializace:
            abort(404, message="Specializace nenalezena")
        return specializace

    @access_control(required_roles=[UserRoleEnum.ADMIN, UserRoleEnum.MAJITEL])
    @specializace_blp.arguments(SpecializaceCreateSchema)
    @specializace_blp.response(200, SpecializaceSchema)
    def put(self, specializace_data, specializace_id):
        specializace = db.session.get(Specializace, specializace_id)
        if not specializace:
            abort(404, message="Specializace nenalezena")

        for key, value in vars(specializace_data).items():
            if key != "_sa_instance_state":
                setattr(specializace, key, value)

        db.session.commit()
        return specializace

    @access_control(required_roles=[UserRoleEnum.ADMIN, UserRoleEnum.MAJITEL])
    @specializace_blp.response(204)
    def delete(self, specializace_id):
        specializace = db.session.get(Specializace, specializace_id)
        if not specializace:
            abort(404, message="Specializace nenalezena")
        db.session.delete(specializace)
        db.session.commit()
        return ""
