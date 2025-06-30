from marshmallow import fields, validate, EXCLUDE
from marshmallow_sqlalchemy import SQLAlchemySchema, auto_field
from app.models.pracovnici import Pracovnici
from app.schemas.specializace import SpecializaceSchema
from app.db import db


class PracovniciSchema(SQLAlchemySchema):
    class Meta:
        model = Pracovnici
        load_instance = True
        unknown = EXCLUDE
        sqla_session = db.session

    pracovnici_id = auto_field(dump_only=True)
    jmeno_prijmeni = auto_field(
        required=True, validate=validate.Length(min=2, max=100))
    login = auto_field(required=True, validate=validate.Length(min=3, max=50))
    pracovni_pozice = auto_field(validate=validate.OneOf(
        ['majitel', 'vedoucí', 'pracovník']))
    tel = auto_field(validate=validate.Regexp(r'^\+?[\d\s-]{6,}$'))
    email = auto_field(validate=validate.Email())
    specializace_id = auto_field(required=True)
    specializace = fields.Nested(
        SpecializaceSchema, only=("nazev_specializace",))


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
    vedouci = auto_field()


class PracovniciUpdateSchema(SQLAlchemySchema):
    class Meta:
        model = Pracovnici
        load_instance = False
        unknown = EXCLUDE
        sqla_session = db.session

    jmeno_prijmeni = auto_field(validate=validate.Length(min=2, max=100))
    login = auto_field(validate=validate.Length(min=3, max=50))
    heslo = auto_field(
        required=False, validate=validate.Length(min=6))  # nepovinné
    pracovni_pozice = auto_field(validate=validate.OneOf(
        ['majitel', 'vedoucí', 'pracovník']))
    tel = auto_field(validate=validate.Regexp(r'^\+?[\d\s-]{6,}$'))
    email = auto_field(validate=validate.Email())
    specializace_id = auto_field()
    vedouci = auto_field()
