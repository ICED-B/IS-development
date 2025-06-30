from marshmallow_sqlalchemy import SQLAlchemySchema, auto_field
from app.models.zakaznici import Zakaznici
from app.db import db


class ZakazniciRezervaceVypisSchema(SQLAlchemySchema):
    class Meta:
        model = Zakaznici
        load_instance = True
        sqla_session = db.session

    zakaznik_id = auto_field(dump_only=True)
    jmeno_prijmeni = auto_field()
    email = auto_field()
    tel = auto_field()
