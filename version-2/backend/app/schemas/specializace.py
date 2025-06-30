from marshmallow import fields, validate, EXCLUDE
from marshmallow_sqlalchemy import SQLAlchemySchema, auto_field
from app.models.specializace import Specializace
from app.db import db  # potřebné pro sqla_session

#  Výstupní schéma – pro GET / zobrazení


class SpecializaceSchema(SQLAlchemySchema):
    class Meta:
        model = Specializace
        schema_name = "SpecializaceSchema"
        load_instance = True
        unknown = EXCLUDE
        sqla_session = db.session

    specializace_id = auto_field(dump_only=True)
    nazev_specializace = auto_field(
        required=True, validate=validate.Length(min=2, max=50))
    popis = auto_field(validate=validate.Length(max=500))

#  Pro POST a PUT – tedy vytvoření a úpravy


class SpecializaceCreateSchema(SQLAlchemySchema):
    class Meta:
        model = Specializace
        schema_name = "SpecializaceCreateSchema"
        load_instance = True
        unknown = EXCLUDE
        sqla_session = db.session

    nazev_specializace = auto_field(
        required=True, validate=validate.Length(min=2, max=50))
    popis = auto_field(validate=validate.Length(max=500))

#  Pro zjednodušený výpis bez vztahů


class SpecializacePlainSchema(SQLAlchemySchema):
    class Meta:
        model = Specializace
        schema_name = "SpecializacePlainSchema"
        load_instance = True
        unknown = EXCLUDE
        sqla_session = db.session

    specializace_id = auto_field()
    nazev_specializace = auto_field()
