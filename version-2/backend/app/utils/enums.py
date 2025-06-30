from enum import Enum

class UserRoleEnum(Enum):
    """
    Enumerace definující dostupné uživatelské role.
    Hodnoty odpovídají tomu, co je uložené v databázi nebo v tokenu.
    """
    ADMIN = "admin"
    MAJITEL = "majitel"
    VEDOUCI = "vedoucí"
    PRACOVNIK = "pracovník"
    ZAKAZNIK = "zakaznik"
