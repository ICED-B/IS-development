from flask import Blueprint, request, render_template, redirect, url_for, session, flash
from werkzeug.security import generate_password_hash, check_password_hash
from app.models import Zakaznici
from app.db import db
from flask_wtf.csrf import generate_csrf
# werkzeug.security -> tvoří hash hesla s random salt, používá PBKDF2 s HMAC a SHA256
# Blueprint pro přihlášení a registraci
auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        # Získání údajů z formuláře
        login_input = request.form.get("login")
        heslo_input = request.form.get("heslo")
        # Vyhledání uživatele podle loginu
        user = Zakaznici.query.filter_by(login=login_input).first()
        # Ověření hesla
        if user and check_password_hash(user.heslo, heslo_input):
            # Přihlášení: uložení údajů do session
            session["user_id"] = user.zakaznik_id
            session["user_name"] = user.jmeno_prijmeni
            session["user_role"] = "zakaznik"
            flash("Přihlášení úspěšné.", "success")
            return redirect(url_for("web.index"))
        # Chybová hláška při špatném loginu nebo heslu
        flash("Neplatný login nebo heslo.", "danger")
    # GET metoda nebo neúspěšné POST – zobraz formulář
    return render_template("login.html", csrf_token=generate_csrf())

@auth_bp.route("/registrace", methods=["GET", "POST"])
def registrace():
    if request.method == "POST":
        try:
            # Vytvoření nového zákazníka
            novy = Zakaznici(
                jmeno_prijmeni=request.form.get("jmeno_prijmeni"),
                login=request.form.get("login"),
                heslo=generate_password_hash(request.form.get("heslo")),
                tel=request.form.get("tel"),
                email=request.form.get("email")
            )
            db.session.add(novy)
            db.session.commit()
            flash("Registrace proběhla úspěšně. Nyní se přihlaste.", "success")
            return redirect(url_for("auth.login"))
        except Exception:
            db.session.rollback()
            flash("Registrace selhala. Login nebo email může být již použit.", "danger")
    return render_template("registrace.html", csrf_token=generate_csrf())

@auth_bp.route("/logout")
def logout():
    # Odhlášení = smazání session
    session.clear()
    flash("Byli jste odhlášeni.", "info")
    return redirect(url_for("web.index"))
# využívá model pro hesla -> hashe a zakazniky  (vkládá CSRF tokeny)
# Výsledkem je, že běžný zákazník se může přihlásit a používat aplikaci jako registrovaný uživatel.