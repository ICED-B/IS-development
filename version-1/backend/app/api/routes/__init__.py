from .zakaznici_routes import zakaznici_blp
from .pracovnici_routes import pracovnici_blp
from .produkty_routes import produkty_blp
from .rezervace_routes import rezervace_blp
from .schuzky_routes import schuzky_blp
from .specializace_routes import specializace_blp
from .csrf_routes import csrf_blp
from .ping_routes import ping_blp
from .auth_routes import auth_blp
from .zakaznici_rezervace_vypis_routes import zakaznici_rv_blp

# Seznam všech blueprintů k registraci v create_app()
blueprints = [
    zakaznici_blp,
    pracovnici_blp,
    produkty_blp,
    rezervace_blp,
    schuzky_blp,
    specializace_blp,
    csrf_blp,
    ping_blp,
    auth_blp,
    zakaznici_rv_blp  # ✅ DOPLNĚNO
]
