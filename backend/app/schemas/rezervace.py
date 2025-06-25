from marshmallow import fields, EXCLUDE, validate
from marshmallow_sqlalchemy import SQLAlchemySchema, auto_field
from app.models.rezervace import Rezervace
from app.db import db
from app.schemas.produkty import ProduktySchema


class RezervaceSchema(SQLAlchemySchema):
    class Meta:
        model = Rezervace
        load_instance = True
        unknown = EXCLUDE
        sqla_session = db.session

    rezervace_id = auto_field(dump_only=True)
    jmeno_prijmeni = auto_field(
        required=True, validate=validate.Length(min=2, max=100))
    tel = auto_field(
        required=True, validate=validate.Regexp(r'^\+?[\d\s-]{6,}$'))
    email = auto_field(required=True, validate=validate.Email())
    rezervovane_datum = auto_field(required=True)
    rezervovany_cas = auto_field(required=True)
    stav = auto_field(dump_only=True)
    produkt_id = auto_field(required=True)
    produkt = fields.Nested(ProduktySchema, only=("nazev_produktu",))


class RezervaceCreateSchema(SQLAlchemySchema):
    class Meta:
        model = Rezervace
        load_instance = True
        unknown = EXCLUDE
        sqla_session = db.session

    jmeno_prijmeni = auto_field(
        required=True, validate=validate.Length(min=2, max=100))
    tel = auto_field(
        required=True, validate=validate.Regexp(r'^\+?[\d\s-]{6,}$'))
    email = auto_field(required=True, validate=validate.Email())
    rezervovane_datum = auto_field(required=True)
    rezervovany_cas = auto_field(required=True)
    stav = auto_field(
        required=False,
        validate=validate.OneOf(["čekající", "schváleno", "zamítnuto"])
    )
    produkt_id = auto_field(required=True)
