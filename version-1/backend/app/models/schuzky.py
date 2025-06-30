from app.db import db
from sqlalchemy import CheckConstraint
from sqlalchemy.orm import relationship

class Schuzky(db.Model):
    __tablename__ = "schuzky"
    schuzka_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    rezervace_id = db.Column(db.Integer, db.ForeignKey("rezervace.rezervace_id"), unique=True, nullable=False)
    pracovnici_id = db.Column(db.Integer, db.ForeignKey("pracovnici.pracovnici_id"), nullable=False)
    stav = db.Column(db.String(20), server_default="planovano")
    poznamka = db.Column(db.Text)

    rezervace = relationship("Rezervace", back_populates="schuzka", lazy=True)
    pracovnici = relationship("Pracovnici", back_populates="schuzky", lazy=True)

    __table_args__ = (
        CheckConstraint("stav IN ('planovano', 'probehlo', 'zruseno')", name="chk_stav_schuzky"),
    )
    def __repr__(self):
        return f"<Schuzka {self.schuzka_id} stav={self.stav}>"