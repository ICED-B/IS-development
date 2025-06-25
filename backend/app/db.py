from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

# Inicializace databázového ORM systému (SQLAlchemy)
db = SQLAlchemy()
# Inicializace nástroje pro správu migrací (změn ve struktuře DB)
migrate = Migrate()

# v __init__.py se volá db.init_ap(app) a migrate.init_app(app, db)
# Díky tomu se ve všech modelech používá from .db import db.