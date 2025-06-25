from app.db import db
from sqlalchemy import CheckConstraint
from sqlalchemy.orm import relationship

class Produkty(db.Model):
    __tablename__ = "produkty"
    produkt_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nazev_produktu = db.Column(db.String(50), unique=True, nullable=False)
    cena = db.Column(db.Integer, nullable=False)
    popis = db.Column(db.String(200))
    specializace_id = db.Column(db.Integer, db.ForeignKey("specializace.specializace_id"), nullable=True)

    specializace = relationship("Specializace", back_populates="produkty")
    rezervace = relationship("Rezervace", back_populates="produkt", lazy=True)

    __table_args__ = (
        CheckConstraint("cena > 0", name="chk_cena_positive"),
    )
    def __repr__(self):
        return f"<Produkt {self.nazev_produktu}>"
