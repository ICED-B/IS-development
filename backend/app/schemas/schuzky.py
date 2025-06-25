from marshmallow import fields, EXCLUDE, validate
from marshmallow_sqlalchemy import SQLAlchemySchema, auto_field
from app.schemas.rezervace import RezervaceSchema
from app.schemas.pracovnici import PracovniciSchema
from app.models.schuzky import Schuzky
from app.db import db


class SchuzkySchema(SQLAlchemySchema):
    class Meta:
        model = Schuzky
        load_instance = True
        unknown = EXCLUDE
        sqla_session = db.session

    schuzka_id = auto_field(dump_only=True)
    stav = auto_field()
    poznamka = auto_field()
    rezervace_id = auto_field(required=True)
    pracovnici_id = auto_field(required=True)

    rezervace = fields.Nested(RezervaceSchema, only=(
        "jmeno_prijmeni", "rezervovane_datum", "rezervovany_cas"))
    pracovnici = fields.Nested(PracovniciSchema, only=("jmeno_prijmeni",))


class SchuzkyCreateSchema(SQLAlchemySchema):
    class Meta:
        model = Schuzky
        load_instance = False
        unknown = EXCLUDE

    stav = auto_field(
        required=False,
        validate=validate.OneOf(["planovano", "probehlo", "zruseno"])
    )
    poznamka = auto_field()
    rezervace_id = auto_field(required=True)
    pracovnici_id = auto_field(required=True)
