from flask.views import MethodView
from app.models import TokenBlacklist
from flask import request
from flask_smorest import abort, Blueprint
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
)
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import timedelta
from app.models import Zakaznici, Pracovnici
from app.db import db
from app.schemas import (
    ZakazniciCreateSchema,
    ZakazniciSchema,
    PracovniciSchema,
)
from marshmallow import Schema, fields

auth_blp = Blueprint("auth", __name__, url_prefix="/api/v1/auth",
                     description="Autentizace a registrace")


class LoginSchema(Schema):
    login = fields.Str(required=True)
    heslo = fields.Str(required=True)


class ZakazniciUpdateSchema(Schema):
    jmeno_prijmeni = fields.String(required=False)
    email = fields.Email(required=False)
    tel = fields.String(required=False)


class PracovniciUpdateSchema(Schema):
    jmeno_prijmeni = fields.String(required=False)
    email = fields.Email(required=False)
    tel = fields.String(required=False)


@auth_blp.route("/login")
class AuthLogin(MethodView):
    @auth_blp.arguments(LoginSchema, location="json")
    def post(self, credentials):
        login = credentials["login"]
        heslo = credentials["heslo"]

        # Zkusit najít zákazníka
        zakaznik = Zakaznici.query.filter_by(login=login).first()
        if zakaznik and check_password_hash(zakaznik.heslo, heslo):
            token = create_access_token(
                identity=str(zakaznik.zakaznik_id),
                additional_claims={
                    "user_id": zakaznik.zakaznik_id,
                    "role": "zakaznik"
                },
                expires_delta=timedelta(minutes=30),
            )
            return {
                "access_token": token,
                "zakaznik_id": zakaznik.zakaznik_id,
                "login": zakaznik.login,
                "role": "zakaznik"
            }

        # Zkusit najít pracovníka
        pracovnik = Pracovnici.query.filter_by(login=login).first()
        if pracovnik and check_password_hash(pracovnik.heslo, heslo):
            role = pracovnik.pracovni_pozice.strip().lower()
            token = create_access_token(
                identity=str(pracovnik.pracovnici_id),
                additional_claims={
                    "user_id": pracovnik.pracovnici_id,
                    "role": role
                },
                expires_delta=timedelta(minutes=30),
            )
            return {
                "access_token": token,
                "pracovnici_id": pracovnik.pracovnici_id,
                "login": pracovnik.login,
                "role": role
            }

        abort(401, message="Neplatný login nebo heslo")


@auth_blp.route("/register")
class AuthRegister(MethodView):
    @auth_blp.arguments(ZakazniciCreateSchema, location="json")
    @auth_blp.response(201, ZakazniciSchema)
    def post(self, data):
        if Zakaznici.query.filter_by(login=data["login"]).first():
            abort(409, message="Tento login je již používán")
        if Zakaznici.query.filter_by(email=data["email"]).first():
            abort(409, message="Tento email je již používán")

        data["heslo"] = generate_password_hash(data["heslo"])
        data["role"] = "zakaznik"
        novy = Zakaznici(**data)
        db.session.add(novy)
        db.session.commit()
        return novy


@auth_blp.route("/me")
class UserInfo(MethodView):
    @jwt_required()
    @auth_blp.response(200, ZakazniciSchema)  # Výchozí schema pro Swagger
    def get(self):
        user_id = get_jwt_identity()
        claims = get_jwt()
        role = claims.get("role")

        if role == "zakaznik":
            uzivatel = db.session.get(Zakaznici, int(user_id))
            schema = ZakazniciSchema()
        elif role in ["pracovník", "vedoucí", "majitel"]:
            uzivatel = db.session.get(Pracovnici, int(user_id))
            schema = PracovniciSchema()
        else:
            abort(400, message="Neplatná role v tokenu")

        if not uzivatel:
            abort(404, message="Uživatel nenalezen")

        data = schema.dump(uzivatel)
        data["role"] = role
        return data


@auth_blp.route("/logout")
class AuthLogout(MethodView):
    @jwt_required()
    def post(self):
        jti = get_jwt()["jti"]

        if TokenBlacklist.query.filter_by(jti=jti).first():
            abort(400, message="Token již byl odhlášen")

        db.session.add(TokenBlacklist(jti=jti))
        db.session.commit()
        return {"message": "Úspěšně odhlášeno"}, 200


class ChangePasswordSchema(Schema):
    stare_heslo = fields.String(required=True, description="Současné heslo")
    nove_heslo = fields.String(required=True, description="Nové heslo")
    nove_heslo_opakovani = fields.String(
        required=True, description="Nové heslo znovu pro ověření")


@auth_blp.route("/change-password")
class ChangePassword(MethodView):
    @jwt_required()
    @auth_blp.arguments(ChangePasswordSchema)
    def post(self, data):
        user_id = get_jwt_identity()
        claims = get_jwt()
        role = claims.get("role")

        stare_heslo = data.get("stare_heslo")
        nove_heslo = data.get("nove_heslo")
        nove_heslo_opakovani = data.get("nove_heslo_opakovani")

        if not stare_heslo or not nove_heslo or not nove_heslo_opakovani:
            abort(400, message="Všechna pole jsou povinná")

        if nove_heslo != nove_heslo_opakovani:
            abort(400, message="Nová hesla se neshodují")

        if role == "zakaznik":
            uzivatel = db.session.get(Zakaznici, int(user_id))
        elif role in ["pracovník", "vedoucí", "majitel"]:
            uzivatel = db.session.get(Pracovnici, int(user_id))
        else:
            abort(400, message="Neplatná role")

        if not uzivatel:
            abort(404, message="Uživatel nenalezen")

        if not check_password_hash(uzivatel.heslo, stare_heslo):
            abort(401, message="Staré heslo není správné")

        uzivatel.heslo = generate_password_hash(nove_heslo)
        db.session.commit()

        return {"message": "Heslo bylo úspěšně změněno."}, 200


@auth_blp.route("/update")
class AuthUpdate(MethodView):
    @jwt_required()
    def put(self):
        user_id = get_jwt_identity()
        claims = get_jwt()
        role = claims.get("role")

        if role == "zakaznik":
            uzivatel = db.session.get(Zakaznici, int(user_id))
            schema = ZakazniciUpdateSchema()
        elif role in ["pracovník", "vedoucí", "majitel"]:
            uzivatel = db.session.get(Pracovnici, int(user_id))
            schema = PracovniciUpdateSchema()
        else:
            abort(400, message="Neplatná role")

        if not uzivatel:
            abort(404, message="Uživatel nenalezen")

        data = schema.load(request.get_json())
        for key, value in data.items():
            setattr(uzivatel, key, value)

        db.session.commit()
        return {"message": "Údaje byly úspěšně aktualizovány."}, 200
