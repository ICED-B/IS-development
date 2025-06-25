from app.db import db
from sqlalchemy import CheckConstraint
from sqlalchemy.orm import relationship

class Pracovnici(db.Model):
    __tablename__ = "pracovnici"
    pracovnici_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    jmeno_prijmeni = db.Column(db.String(100), nullable=False)
    login = db.Column(db.String(50), unique=True, nullable=False)
    heslo = db.Column(db.String(256), nullable=False)
    pracovni_pozice = db.Column(db.String(50), nullable=False)
    vedouci = db.Column(db.Integer, db.ForeignKey("pracovnici.pracovnici_id"), nullable=True)
    specializace_id = db.Column(db.Integer, db.ForeignKey("specializace.specializace_id"), nullable=True)
    tel = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)

    # Vztahy
    specializace = relationship("Specializace", back_populates="pracovnici")
    podrizeni = relationship("Pracovnici", remote_side=[pracovnici_id], backref="nadrizeny", lazy=True)
    schuzky = relationship("Schuzky", back_populates="pracovnici", lazy=True)

    # Omezení na validní pozice
    __table_args__ = (
        CheckConstraint("pracovni_pozice IN ('majitel', 'vedoucí', 'pracovník')", name="chk_pracovni_pozice"),
    )
    def __repr__(self):
        return f"<Pracovnik {self.jmeno_prijmeni}>"