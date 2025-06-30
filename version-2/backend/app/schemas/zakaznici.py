from marshmallow import validate, EXCLUDE
from marshmallow_sqlalchemy import SQLAlchemySchema, auto_field
from app.models.zakaznici import Zakaznici
from app.db import db  # Přidáno kvůli sqla_session


class ZakazniciSchema(SQLAlchemySchema):
    class Meta:
        model = Zakaznici
        load_instance = True
        unknown = EXCLUDE
        sqla_session = db.session

    zakaznik_id = auto_field(dump_only=True)
    jmeno_prijmeni = auto_field(
        required=True, validate=validate.Length(min=2, max=100))
    login = auto_field(required=True, validate=validate.Length(min=3, max=50))
    tel = auto_field(validate=validate.Regexp(r'^\+?[\d\s-]{6,}$'))
    email = auto_field(validate=validate.Email())
    # role bude vidět jen při výpisu (např. /me)
    role = auto_field(dump_only=True)


class ZakazniciCreateSchema(SQLAlchemySchema):
    class Meta:
        model = Zakaznici
        load_instance = False
        unknown = EXCLUDE

    jmeno_prijmeni = auto_field(
        required=True, validate=validate.Length(min=2, max=100))
    login = auto_field(required=True, validate=validate.Length(min=3, max=50))
    heslo = auto_field(required=True, validate=validate.Length(min=6))
    tel = auto_field(
        required=True, validate=validate.Regexp(r'^\+?[\d\s-]{6,}$'))
    email = auto_field(required=True, validate=validate.Email())
    # role nikdy nepřijímá vstup, jen výstup
    role = auto_field(load_default="zakaznik", dump_only=True)


class ZakazniciUpdateSchema(SQLAlchemySchema):
    class Meta:
        model = Zakaznici
        load_instance = False
        unknown = EXCLUDE

    jmeno_prijmeni = auto_field(
        required=True, validate=validate.Length(min=2, max=100))
    login = auto_field(required=True, validate=validate.Length(min=3, max=50))
    heslo = auto_field(
        required=False, validate=validate.Length(min=6))  # není povinné
    tel = auto_field(
        required=True, validate=validate.Regexp(r'^\+?[\d\s-]{6,}$'))
    email = auto_field(required=True, validate=validate.Email())
    role = auto_field(load_default="zakaznik", dump_only=True)
