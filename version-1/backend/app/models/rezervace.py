from app.db import db
from sqlalchemy import CheckConstraint
from sqlalchemy.orm import relationship

class Rezervace(db.Model):
    __tablename__ = "rezervace"
    rezervace_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    rezervovany_cas = db.Column(db.Time, nullable=False)
    rezervovane_datum = db.Column(db.Date, nullable=False)
    jmeno_prijmeni = db.Column(db.String(100), nullable=False)
    tel = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(100), nullable=True)
    produkt_id = db.Column(db.Integer, db.ForeignKey("produkty.produkt_id"), nullable=False)
    stav = db.Column(db.String(20), server_default="čekající")
    zakaznik_id = db.Column(db.Integer, db.ForeignKey('zakaznici.zakaznik_id'), nullable=True)

    produkt = relationship("Produkty", back_populates="rezervace", lazy=True)
    schuzka = relationship("Schuzky", uselist=False, back_populates="rezervace", lazy=True)

    __table_args__ = (
        CheckConstraint("rezervovany_cas BETWEEN '08:00:00' AND '16:00:00'", name="chk_cas_interval"),
        CheckConstraint("stav IN ('čekající', 'schváleno', 'zamítnuto')", name="chk_stav_rezervace"),
    )
    def __repr__(self):
        return f"<Rezervace {self.jmeno_prijmeni} {self.rezervovane_datum}>"
