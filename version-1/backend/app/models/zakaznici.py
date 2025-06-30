from app.db import db
from sqlalchemy import CheckConstraint
from sqlalchemy.orm import relationship

class Zakaznici(db.Model):
    __tablename__ = "zakaznici"
    zakaznik_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    jmeno_prijmeni = db.Column(db.String(100), nullable=False)
    login = db.Column(db.String(50), nullable=False)
    heslo = db.Column(db.String(256), nullable=False)
    tel = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    role = db.Column(db.String(20),default="zakaznik", nullable=False)

    def __repr__(self):
        return f"<Zakaznik {self.jmeno_prijmeni}>"