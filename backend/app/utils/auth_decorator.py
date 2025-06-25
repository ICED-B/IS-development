from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt
from flask_smorest import abort
from app.models.token_blacklist import TokenBlacklist
from app.utils.enums import UserRoleEnum
from app.db import db

def access_control(required_roles=None, allow_owner=False, owner_id_param_name=None, owner_model=None, owner_field=None, refresh=False):
    """
    Dekorátor pro ochranu endpointů pomocí JWT + kontrola rolí a vlastnictví.

    :param required_roles: seznam nebo tuple rolí (stringy nebo UserRoleEnum)
    :param allow_owner: pokud True, povolí přístup vlastníkovi záznamu
    :param owner_id_param_name: jméno URL parametru (např. 'zakaznik_id')
    :param owner_model: modelová třída (např. Schuzky)
    :param owner_field: název pole v modelu, kde je ID vlastníka (např. 'pracovnik_id')
    """
    processed_required_roles = []
    if required_roles:
        required_roles_list = [required_roles] if not isinstance(required_roles, (list, tuple)) else list(required_roles)
        for role in required_roles_list:
            if isinstance(role, UserRoleEnum):
                processed_required_roles.append(role.value)
            elif isinstance(role, str):
                processed_required_roles.append(role)
            else:
                raise ValueError("Role v required_roles musí být string nebo UserRoleEnum.")

    if allow_owner and not owner_id_param_name:
        raise ValueError("owner_id_param_name musí být specifikován, pokud allow_owner=True.")

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request(refresh=refresh)

            jti = get_jwt().get("jti")
            if jti:
                token_blacklisted = db.session.execute(
                    db.select(TokenBlacklist).filter_by(jti=jti)
                ).scalar_one_or_none()
                if token_blacklisted:
                    abort(401, message="Token byl odvolán (na blacklistu).")

            claims = get_jwt()
            current_user_id = claims.get("user_id")
            current_user_role = claims.get("role")
            access_granted = False

            # 1. Vlastnictví – pokud povoleno
            if allow_owner:
                target_owner_id = kwargs.get(owner_id_param_name)
                if target_owner_id:
                    # Pokud ID v URL je stejné jako identita
                    if str(current_user_id) == str(target_owner_id):
                        access_granted = True
                    # Pokud máme model i pole – porovnáme vlastnictví záznamu
                    elif owner_model and owner_field:
                        instance = db.session.get(owner_model, int(target_owner_id))
                        if instance and str(getattr(instance, owner_field, None)) == str(current_user_id):
                            access_granted = True

            # 2. Role – pokud nebylo povoleno vlastnictvím
            if not access_granted and processed_required_roles:
                if current_user_role in processed_required_roles:
                    access_granted = True

            if access_granted:
                return fn(*args, **kwargs)
            else:
                reasons = []
                if processed_required_roles:
                    reasons.append(f"jedna z rolí: {', '.join(processed_required_roles)}")
                if allow_owner:
                    reasons.append("vlastnictví zdroje")
                abort(403, message=f"Přístup odepřen. Vyžadováno: {' nebo '.join(reasons)}.")

        return wrapper
    return decorator
