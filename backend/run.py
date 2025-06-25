from app.models import Pracovnici, Zakaznici  # Importujte své modely
from app import create_app, db  # Import z lokálního balíčku app

import os

# Získání názvu konfigurace z proměnné prostředí nebo default
config_name = os.getenv('FLASK_CONFIG') or 'default'
app = create_app(config_name)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)  
