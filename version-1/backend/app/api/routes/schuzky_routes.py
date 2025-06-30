from flask.views import MethodView
from flask_smorest import abort, Blueprint
from flask_jwt_extended import get_jwt
from app.models import Schuzky
from app.schemas import SchuzkySchema, SchuzkyCreateSchema
from app.db import db
from app.utils.auth_decorator import access_control
from app.utils.enums import UserRoleEnum

schuzky_blp = Blueprint("schuzky", __name__, url_prefix="/api/v1/schuzky")


@schuzky_blp.route("/")
class SchuzkyResource(MethodView):
    @access_control(required_roles=[
        UserRoleEnum.ADMIN,
        UserRoleEnum.MAJITEL,
        UserRoleEnum.VEDOUCI,
        UserRoleEnum.PRACOVNIK
    ])
    @schuzky_blp.response(200, SchuzkySchema(many=True))
    def get(self):
        claims = get_jwt()
        role = claims.get("role")
        user_id = claims.get("user_id")

        if role == "pracovnik":
            return Schuzky.query.filter_by(pracovnik_id=user_id).all()
        else:
            return Schuzky.query.all()

    @access_control(required_roles=[
        UserRoleEnum.ADMIN,
        UserRoleEnum.MAJITEL,
        UserRoleEnum.VEDOUCI
    ])
    @schuzky_blp.arguments(SchuzkyCreateSchema)
    @schuzky_blp.response(201, SchuzkySchema)
    def post(self, data):
        try:
            nova_schuzka = Schuzky(**data)
            db.session.add(nova_schuzka)
            db.session.commit()
            return nova_schuzka
        except Exception as e:
            print("CHYBA při vytváření schůzky:", e)
            abort(500, message="Nepodařilo se vytvořit schůzku.")


@schuzky_blp.route("/<int:schuzka_id>")
class SchuzkaDetailResource(MethodView):
    @access_control(
        required_roles=[
            UserRoleEnum.ADMIN,
            UserRoleEnum.MAJITEL,
            UserRoleEnum.VEDOUCI
        ],
        allow_owner=True,
        owner_id_param_name="schuzka_id",
        owner_model=Schuzky
    )
    @schuzky_blp.response(200, SchuzkySchema)
    def get(self, schuzka_id):
        schuzka = db.session.get(Schuzky, schuzka_id)
        if not schuzka:
            abort(404, message="Schůzka nenalezena")
        return schuzka

    @access_control(
        required_roles=[
            UserRoleEnum.ADMIN,
            UserRoleEnum.MAJITEL,
            UserRoleEnum.VEDOUCI
        ]
    )
    @schuzky_blp.arguments(SchuzkyCreateSchema)
    @schuzky_blp.response(200, SchuzkySchema)
    def put(self, data, schuzka_id):
        schuzka = db.session.get(Schuzky, schuzka_id)
        if not schuzka:
            abort(404, message="Schůzka nenalezena")
        for key, value in data.items():
            setattr(schuzka, key, value)
        db.session.commit()
        return schuzka

    @access_control(
        required_roles=[
            UserRoleEnum.ADMIN,
            UserRoleEnum.MAJITEL,
            UserRoleEnum.VEDOUCI
        ]
    )
    @schuzky_blp.response(204)
    def delete(self, schuzka_id):
        schuzka = db.session.get(Schuzky, schuzka_id)
        if not schuzka:
            abort(404, message="Schůzka nenalezena")
        db.session.delete(schuzka)
        db.session.commit()
        return ""
