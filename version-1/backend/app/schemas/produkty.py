from marshmallow import fields, validate, EXCLUDE
from marshmallow_sqlalchemy import SQLAlchemySchema, auto_field
from app.schemas.specializace import SpecializaceSchema
from app.models.produkty import Produkty
from app.db import db  # ← důležité


class ProduktySchema(SQLAlchemySchema):
    class Meta:
        model = Produkty
        schema_name = "ProduktySchema"
        load_instance = True
        unknown = EXCLUDE
        sqla_session = db.session  # ← přidat

    produkt_id = auto_field(dump_only=True)
    nazev_produktu = auto_field(
        required=True, validate=validate.Length(min=2, max=100))
    cena = auto_field(required=True)
    popis = auto_field(validate=validate.Length(max=500))
    specializace_id = auto_field(required=True)
    specializace = fields.Nested(
        SpecializaceSchema, only=["nazev_specializace"])
    from app.db import db


class ProduktyCreateSchema(SQLAlchemySchema):
    class Meta:
        model = Produkty
        schema_name = "ProduktyCreateSchema"
        load_instance = True
        unknown = EXCLUDE
        sqla_session = db.session  # ← přidat

    nazev_produktu = auto_field(
        required=True, validate=validate.Length(min=2, max=100))
    cena = auto_field(required=True)
    popis = auto_field(validate=validate.Length(max=500))
    specializace_id = auto_field(required=True)


class ProduktyPlainSchema(SQLAlchemySchema):
    class Meta:
        model = Produkty
        schema_name = "ProduktyPlainSchema"
        load_instance = True
        unknown = EXCLUDE
        sqla_session = db.session  # ← přidat

    produkt_id = auto_field()
    nazev_produktu = auto_field()
    cena = auto_field()
