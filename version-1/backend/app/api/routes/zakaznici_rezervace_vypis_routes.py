from flask.views import MethodView
from flask_smorest import Blueprint, abort
from app.models import Zakaznici
from app.schemas.zakaznici_rezervace_vypis import ZakazniciRezervaceVypisSchema
from app.db import db
from app.utils.auth_decorator import access_control
from app.utils.enums import UserRoleEnum

zakaznici_rv_blp = Blueprint(
    "zakaznici_rv", __name__, url_prefix="/api/v1/zakaznici-rv")


@zakaznici_rv_blp.route("/")
class ZakazniciRVListResource(MethodView):
    @access_control(required_roles=[UserRoleEnum.ADMIN, UserRoleEnum.MAJITEL, UserRoleEnum.VEDOUCI])
    @zakaznici_rv_blp.response(200, ZakazniciRezervaceVypisSchema(many=True))
    def get(self):
        return Zakaznici.query.order_by(Zakaznici.jmeno_prijmeni).all()


@zakaznici_rv_blp.route("/<int:zakaznik_id>")
class ZakazniciRVDetailResource(MethodView):
    @access_control(required_roles=[UserRoleEnum.ADMIN, UserRoleEnum.MAJITEL, UserRoleEnum.VEDOUCI])
    @zakaznici_rv_blp.response(200, ZakazniciRezervaceVypisSchema)
    def get(self, zakaznik_id):
        zakaznik = db.session.get(Zakaznici, zakaznik_id)
        if not zakaznik:
            abort(404, message="Zákazník nenalezen")
        return zakaznik
