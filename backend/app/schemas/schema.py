from marshmallow import fields, validate, EXCLUDE
from marshmallow_sqlalchemy import SQLAlchemySchema, auto_field
from app.models import Pracovnici, Zakaznici
from app.db import db


class PracovniciCreateSchema(SQLAlchemySchema):
    class Meta:
        model = Pracovnici
        load_instance = True
        unknown = EXCLUDE
        sqla_session = db.session

    jmeno_prijmeni = auto_field(
        required=True, validate=validate.Length(min=2, max=100))
    login = auto_field(required=True, validate=validate.Length(min=3, max=50))
    heslo = auto_field(required=True, validate=validate.Length(min=6))
    pracovni_pozice = auto_field(required=True, validate=validate.OneOf([
                                 'majitel', 'vedoucí', 'pracovník']))
    tel = auto_field(
        required=True, validate=validate.Regexp(r'^\+?[\d\s-]{6,}$'))
    email = auto_field(required=True, validate=validate.Email())
    specializace_id = auto_field(required=True)
    vedouci = auto_field(allow_none=True)  # Volitelné pole


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
    role = auto_field(required=True, validate=validate.OneOf(["zakaznik"]))
