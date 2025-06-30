import os
from dotenv import load_dotenv

# Načtení proměnných z .env souboru
basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, "../.env"))

# ---------- ZÁKLADNÍ KONFIGURAČNÍ TŘÍDA ----------
class Config:
    """Základní konfigurace pro všechny režimy (vývoj, test, produkce)."""

    SECRET_KEY = os.environ.get("SECRET_KEY") or "vychozi_slabý_klíč_pro_vývoj"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False  # Lze zapnout na True pro logování SQL dotazů

    # Nastavení pro Flask-Smorest (API dokumentace)
    API_TITLE = "IS Šablona API"
    API_VERSION = "v1"
    OPENAPI_VERSION = "3.0.2"
    OPENAPI_URL_PREFIX = "/api/docs"
    OPENAPI_SWAGGER_UI_PATH = "/swagger"
    OPENAPI_SWAGGER_UI_URL = "https://cdn.jsdelivr.net/npm/swagger-ui-dist/"

# ---------- KONFIGURACE PRO VÝVOJ ----------
class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = (
        os.environ.get("DATABASE_URL")
        or "postgresql+psycopg://user:password@localhost/dev_db"
    )
    SQLALCHEMY_ECHO = True  # Zapne výpis SQL příkazů do konzole

# ---------- KONFIGURACE PRO TESTY ----------
class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = (
        os.environ.get("TEST_DATABASE_URL")
        or "sqlite:///:memory:"
    )
    WTF_CSRF_ENABLED = False  # Vypne CSRF pro testovací účely

# ---------- KONFIGURACE PRO PRODUKCI ----------
class ProductionConfig(Config):
    DEBUG = False
    TESTING = False
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")  # pro ostrý provoz - V produkci MUSÍ být nastaveno
    

# ---------- MAPA JMEN NA KONFIGURAČNÍ TŘÍDY ----------
config_by_name = dict(
    development=DevelopmentConfig,
    testing=TestingConfig,
    production=ProductionConfig,
    default=DevelopmentConfig,
)
# Funkce pro získání secret klíče, pokud není nastaven
def get_secret_key():
    key = os.environ.get("SECRET_KEY")
    if not key:
        # V produkci by toto mělo vyvolat chybu nebo použít bezpečnější default
        print("VAROVÁNÍ: SECRET_KEY není nastaven v .env souboru!")
        key = "vychozi_slabý_klíč_pro_vývoj_oprav_mne"
    return key

# zde se volá config_by_name ["development"]