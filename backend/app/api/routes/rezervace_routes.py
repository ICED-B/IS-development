from flask.views import MethodView
from flask_smorest import abort, Blueprint
from flask_jwt_extended import get_jwt, verify_jwt_in_request
from app.models import Rezervace, Zakaznici
from app.schemas import RezervaceSchema, RezervaceCreateSchema
from app.db import db
from app.utils.auth_decorator import access_control
from app.utils.enums import UserRoleEnum

rezervace_blp = Blueprint("rezervace", __name__, url_prefix="/api/v1/rezervace")


@rezervace_blp.route("/")
class RezervaceResource(MethodView):
    @access_control(required_roles=[
        UserRoleEnum.ADMIN,
        UserRoleEnum.MAJITEL,
        UserRoleEnum.VEDOUCI
    ])
    @rezervace_blp.response(200, RezervaceSchema(many=True))
    def get(self):
        return Rezervace.query.order_by(Rezervace.rezervovane_datum).all()

    # Vytvářet rezervaci může kdokoli – bez autentizace
    @rezervace_blp.arguments(RezervaceCreateSchema)
    @rezervace_blp.response(201, RezervaceSchema)
    def post(self, rezervace_data):
        zakaznik_id = None
        try:
            verify_jwt_in_request(optional=True)
            claims = get_jwt()
            if claims.get("role") == "zakaznik":
                zakaznik_id = claims.get("user_id")
        except Exception:
            pass  # nepřihlášený uživatel

        rezervace = rezervace_data  # Oprava zde
        if zakaznik_id:
            rezervace.zakaznik_id = zakaznik_id

        db.session.add(rezervace)
        db.session.commit()
        return rezervace


@rezervace_blp.route("/<int:rezervace_id>")
class RezervaceDetailResource(MethodView):
    @rezervace_blp.response(200, RezervaceSchema)
    def get(self, rezervace_id):
        rezervace = db.session.get(Rezervace, rezervace_id)
        if not rezervace:
            abort(404, message="Rezervace nenalezena")

        try:
            verify_jwt_in_request(optional=True)
            claims = get_jwt()
            role = claims.get("role")
            user_id = claims.get("user_id")

            if role in ["admin", "majitel", "vedouci", "pracovnik"]:
                return rezervace

            if role == "zakaznik":
                if rezervace.zakaznik_id == user_id:
                    return rezervace

                zakaznik = db.session.get(Zakaznici, user_id)
                if zakaznik and (
                    rezervace.email == zakaznik.email or
                    rezervace.tel == zakaznik.tel or
                    rezervace.jmeno_prijmeni == zakaznik.jmeno_prijmeni
                ):
                    return rezervace

        except Exception:
            pass

        abort(403, message="Nemáte oprávnění zobrazit tuto rezervaci.")

    @access_control(required_roles=[
        UserRoleEnum.ADMIN,
        UserRoleEnum.MAJITEL,
        UserRoleEnum.VEDOUCI
    ])
    @rezervace_blp.arguments(RezervaceCreateSchema)
    @rezervace_blp.response(200, RezervaceSchema)
    def put(self, new_data, rezervace_id):
        rezervace = db.session.get(Rezervace, rezervace_id)
        if not rezervace:
            abort(404, message="Rezervace nenalezena")
        for key, value in vars(new_data).items():
            if key != "_sa_instance_state":
                setattr(rezervace, key, value)
        db.session.commit()
        return rezervace

    @rezervace_blp.response(204)
    def delete(self, rezervace_id):
        rezervace = db.session.get(Rezervace, rezervace_id)
        if not rezervace:
            abort(404, message="Rezervace nenalezena")
        db.session.delete(rezervace)
        db.session.commit()
        return ""


# ✅ Nový endpoint – rezervace aktuálního zákazníka
@rezervace_blp.route("/moje")
class MojeRezervaceResource(MethodView):
    @access_control(required_roles=[UserRoleEnum.ZAKAZNIK])
    @rezervace_blp.response(200, RezervaceSchema(many=True))
    def get(self):
        claims = get_jwt()
        user_id = claims.get("user_id")

        zakaznik = db.session.get(Zakaznici, user_id)
        if not zakaznik:
            abort(404, message="Zákazník nenalezen")

        # Rezervace podle zakaznik_id nebo shodných údajů
        rezervace = Rezervace.query.filter(
            (Rezervace.zakaznik_id == zakaznik.zakaznik_id) |
            (Rezervace.email == zakaznik.email) |
            (Rezervace.tel == zakaznik.tel) |
            (Rezervace.jmeno_prijmeni == zakaznik.jmeno_prijmeni)
        ).order_by(Rezervace.rezervovane_datum).all()

        return rezervace
