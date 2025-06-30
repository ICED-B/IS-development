from flask.views import MethodView
from flask_smorest import abort, Blueprint
from app.models import Zakaznici, Pracovnici
from app.schemas import ZakazniciSchema, ZakazniciCreateSchema, ZakazniciUpdateSchema
from app.db import db
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select
from app.utils.auth_decorator import access_control
from app.utils.enums import UserRoleEnum
from werkzeug.security import generate_password_hash

zakaznici_blp = Blueprint("zakaznici", __name__,
                          url_prefix="/api/v1/zakaznici")


@zakaznici_blp.route("/")
class ZakazniciResource(MethodView):
    @access_control(required_roles=[UserRoleEnum.ADMIN, UserRoleEnum.MAJITEL])
    @zakaznici_blp.response(200, ZakazniciSchema(many=True))
    def get(self):
        return Zakaznici.query.order_by(Zakaznici.zakaznik_id).all()

    @zakaznici_blp.arguments(ZakazniciCreateSchema)
    @zakaznici_blp.response(201, ZakazniciSchema)
    def post(self, data):
        # Kontrola napříč oběma tabulkami
        if Zakaznici.query.filter((Zakaznici.login == data["login"]) | (Zakaznici.email == data["email"])).first():
            abort(400, message="Login nebo email je již použit!")
        if Pracovnici.query.filter((Pracovnici.login == data["login"]) | (Pracovnici.email == data["email"])).first():
            abort(400, message="Login nebo email je již použit!")

        try:
            data["heslo"] = generate_password_hash(data["heslo"])
            data["role"] = "zakaznik"
            novy = Zakaznici(**data)
            db.session.add(novy)
            db.session.commit()
            return novy
        except IntegrityError as e:
            db.session.rollback()
            abort(400, message="Neplatná data: " + str(e.orig))
        except Exception as e:
            db.session.rollback()
            abort(500, message="Neočekávaná chyba: " + str(e))


@zakaznici_blp.route("/<int:zakaznik_id>")
class ZakaznikDetailResource(MethodView):
    @access_control(required_roles=[UserRoleEnum.ADMIN, UserRoleEnum.MAJITEL], allow_owner=True, owner_id_param_name="zakaznik_id")
    @zakaznici_blp.response(200, ZakazniciSchema)
    def get(self, zakaznik_id):
        zakaznik = db.session.get(Zakaznici, zakaznik_id)
        if not zakaznik:
            abort(404, message="Zákazník nenalezen")
        return zakaznik

    @access_control(required_roles=[UserRoleEnum.ADMIN, UserRoleEnum.MAJITEL], allow_owner=True, owner_id_param_name="zakaznik_id")
    @zakaznici_blp.arguments(ZakazniciUpdateSchema)
    @zakaznici_blp.response(200, ZakazniciSchema)
    def put(self, data, zakaznik_id):
        zakaznik = db.session.get(Zakaznici, zakaznik_id)
        if not zakaznik:
            abort(404, message="Zákazník nenalezen")

        # Kontrola duplicitních údajů (mimo sebe) napříč oběma tabulkami
        if (
            Zakaznici.query.filter(
                Zakaznici.login == data["login"], Zakaznici.zakaznik_id != zakaznik_id).first()
            or Zakaznici.query.filter(Zakaznici.email == data["email"], Zakaznici.zakaznik_id != zakaznik_id).first()
            or Pracovnici.query.filter((Pracovnici.login == data["login"]) | (Pracovnici.email == data["email"])).first()
        ):
            abort(
                409, message="Zadaný login nebo email je již používán jiným uživatelem.")

        if "heslo" in data:
            data["heslo"] = generate_password_hash(data["heslo"])

        for key, value in data.items():
            setattr(zakaznik, key, value)

        try:
            db.session.commit()
        except IntegrityError as e:
            db.session.rollback()
            abort(400, message="Neplatná data: " + str(e.orig))
        except Exception as e:
            db.session.rollback()
            abort(500, message="Chyba při aktualizaci zákazníka: " + str(e))
        return zakaznik

    @access_control(required_roles=[UserRoleEnum.ADMIN, UserRoleEnum.MAJITEL], allow_owner=True, owner_id_param_name="zakaznik_id")
    @zakaznici_blp.response(204)
    def delete(self, zakaznik_id):
        zakaznik = db.session.get(Zakaznici, zakaznik_id)
        if not zakaznik:
            abort(404, message="Zákazník nenalezen")
        db.session.delete(zakaznik)
        db.session.commit()
        return ""
