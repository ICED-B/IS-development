from flask.views import MethodView
from flask_smorest import abort, Blueprint
from app.models import Produkty
from app.schemas import ProduktySchema, ProduktyCreateSchema
from app.db import db
from app.utils.auth_decorator import access_control
from app.utils.enums import UserRoleEnum

produkty_blp = Blueprint("produkty", __name__, url_prefix="/api/v1/produkty")


@produkty_blp.route("/")
class ProduktyResource(MethodView):
    @produkty_blp.response(200, ProduktySchema(many=True))
    def get(self):
        return Produkty.query.order_by(Produkty.nazev_produktu).all()

    @access_control(required_roles=[
        UserRoleEnum.ADMIN,
        UserRoleEnum.MAJITEL,
        UserRoleEnum.VEDOUCI
    ])
    @produkty_blp.arguments(ProduktyCreateSchema)
    @produkty_blp.response(201, ProduktySchema)
    def post(self, produkt):
        try:
            stmt = db.select(Produkty).where(Produkty.nazev_produktu == produkt.nazev_produktu)
            existing = db.session.scalars(stmt).first()
            if existing:
                abort(409, message="Produkt se stejným názvem již existuje.")

            db.session.add(produkt)
            db.session.commit()
            return produkt
        except Exception as e:
            print("CHYBA při vytváření produktu:", e)
            abort(500, message=str(e))


@produkty_blp.route("/<int:produkt_id>")
class ProduktDetailResource(MethodView):
    @produkty_blp.response(200, ProduktySchema)
    def get(self, produkt_id):
        produkt = db.session.get(Produkty, produkt_id)
        if not produkt:
            abort(404, message="Produkt nenalezen")
        return produkt

    @access_control(required_roles=[
        UserRoleEnum.ADMIN,
        UserRoleEnum.MAJITEL,
        UserRoleEnum.VEDOUCI
    ])
    @produkty_blp.arguments(ProduktyCreateSchema)
    @produkty_blp.response(200, ProduktySchema)
    def put(self, produkt_data, produkt_id):
        produkt = db.session.get(Produkty, produkt_id)
        if not produkt:
            abort(404, message="Produkt nenalezen")

        for key, value in vars(produkt_data).items():
            if key != "_sa_instance_state":
                setattr(produkt, key, value)

        db.session.commit()
        return produkt

    @access_control(required_roles=[
        UserRoleEnum.ADMIN,
        UserRoleEnum.MAJITEL,
        UserRoleEnum.VEDOUCI
    ])
    @produkty_blp.response(204)
    def delete(self, produkt_id):
        produkt = db.session.get(Produkty, produkt_id)
        if not produkt:
            abort(404, message="Produkt nenalezen")

        db.session.delete(produkt)
        db.session.commit()
        return ""
