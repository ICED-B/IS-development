from app.db import db
from sqlalchemy import CheckConstraint
from sqlalchemy.orm import relationship

class Specializace(db.Model):
    __tablename__ = "specializace"
    specializace_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nazev_specializace = db.Column(db.String(50), unique=True, nullable=False)
    popis = db.Column(db.String(250))

    # Vztahy s dalšími tabulkami
    pracovnici = relationship("Pracovnici", back_populates="specializace", lazy=True)
    produkty = relationship("Produkty", back_populates="specializace", lazy=True)

    def __repr__(self):
        return f"<Specializace {self.nazev_specializace}>"