from flask.views import MethodView
from flask_smorest import abort, Blueprint
from werkzeug.security import generate_password_hash
from sqlalchemy.exc import IntegrityError
from app.models import Pracovnici, Zakaznici
from app.schemas import PracovniciSchema, PracovniciCreateSchema, PracovniciUpdateSchema
from app.db import db
from app.utils.auth_decorator import access_control
from app.utils.enums import UserRoleEnum

pracovnici_blp = Blueprint("pracovnici", __name__,
                           url_prefix="/api/v1/pracovnici")


@pracovnici_blp.route("/")
class PracovniciResource(MethodView):
    @access_control(required_roles=[UserRoleEnum.ADMIN, UserRoleEnum.MAJITEL])
    @pracovnici_blp.response(200, PracovniciSchema(many=True))
    def get(self):
        return db.session.query(Pracovnici).order_by(Pracovnici.jmeno_prijmeni).all()

    @access_control(required_roles=[UserRoleEnum.ADMIN, UserRoleEnum.MAJITEL])
    @pracovnici_blp.arguments(PracovniciCreateSchema)
    @pracovnici_blp.response(201, PracovniciSchema)
    def post(self, data):
        if db.session.query(Pracovnici).filter(
            (Pracovnici.login == data.login) | (Pracovnici.email == data.email)
        ).first():
            abort(409, message="Login nebo email je již použit!")

        if db.session.query(Zakaznici).filter(
            (Zakaznici.login == data.login) | (Zakaznici.email == data.email)
        ).first():
            abort(409, message="Login nebo email je již použit!")

        data_dict = {
            "jmeno_prijmeni": data.jmeno_prijmeni,
            "login": data.login,
            "heslo": generate_password_hash(data.heslo),
            "pracovni_pozice": data.pracovni_pozice,
            "vedouci": data.vedouci,
            "specializace_id": data.specializace_id,
            "tel": data.tel,
            "email": data.email
        }

        try:
            novy = Pracovnici(**data_dict)
            db.session.add(novy)
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            abort(409, message="Login nebo email již existuje.")
        except Exception as e:
            db.session.rollback()
            print("CHYBA při POST /pracovnici:", e)
            abort(500, message="Chyba serveru při vytváření pracovníka.")
        return novy


@pracovnici_blp.route("/<int:pracovnici_id>")
class PracovnikDetailResource(MethodView):
    @access_control(required_roles=[UserRoleEnum.ADMIN, UserRoleEnum.MAJITEL], allow_owner=True, owner_id_param_name="pracovnici_id")
    @pracovnici_blp.response(200, PracovniciSchema)
    def get(self, pracovnici_id):
        obj = db.session.get(Pracovnici, pracovnici_id)
        if not obj:
            abort(404, message="Pracovník nenalezen")
        return obj

    @access_control(required_roles=[UserRoleEnum.ADMIN, UserRoleEnum.MAJITEL], allow_owner=True, owner_id_param_name="pracovnici_id")
    @pracovnici_blp.arguments(PracovniciUpdateSchema)
    @pracovnici_blp.response(200, PracovniciSchema)
    def put(self, update_data, pracovnici_id):
        obj = db.session.get(Pracovnici, pracovnici_id)
        if not obj:
            abort(404, message="Pracovník nenalezen")

        # Kontrola duplicitních údajů napříč oběma tabulkami (mimo sebe)
        if update_data.get("login") != obj.login:
            if db.session.query(Pracovnici).filter(Pracovnici.login == update_data["login"]).first():
                abort(409, message="Tento login je již používán jiným pracovníkem.")
            if db.session.query(Zakaznici).filter(Zakaznici.login == update_data["login"]).first():
                abort(409, message="Tento login je již používán zákazníkem.")

        if update_data.get("email") != obj.email:
            if db.session.query(Pracovnici).filter(Pracovnici.email == update_data["email"]).first():
                abort(409, message="Tento email je již používán jiným pracovníkem.")
            if db.session.query(Zakaznici).filter(Zakaznici.email == update_data["email"]).first():
                abort(409, message="Tento email je již používán zákazníkem.")

        for attr in [
            "jmeno_prijmeni", "login", "pracovni_pozice", "tel", "email",
            "specializace_id", "vedouci"
        ]:
            if attr in update_data:
                setattr(obj, attr, update_data[attr])

        if getattr(update_data, "heslo", None):
            obj.heslo = generate_password_hash(update_data.heslo)

        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print("CHYBA při PUT /pracovnici:", e)
            abort(500, message="Chyba při aktualizaci pracovníka.")
        return obj

    @access_control(required_roles=[UserRoleEnum.ADMIN, UserRoleEnum.MAJITEL], allow_owner=True, owner_id_param_name="pracovnici_id")
    @pracovnici_blp.response(204)
    def delete(self, pracovnici_id):
        obj = db.session.get(Pracovnici, pracovnici_id)
        if not obj:
            abort(404, message="Pracovník nenalezen")
        try:
            db.session.delete(obj)
            db.session.commit()
        except Exception:
            db.session.rollback()
            abort(500, message="Chyba při mazání pracovníka.")
        return ""
