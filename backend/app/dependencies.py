from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.core.security import decode_token
from app.core.exceptions import UnauthorizedError, ForbiddenError
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        raise UnauthorizedError("Invalid token")
    
    user_id = payload["sub"]
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    if not user:
        raise UnauthorizedError("User not found")
    
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise UnauthorizedError("Inactive user")
    return current_user

def require_roles(*roles: str):
    async def role_dependency(current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role not in roles:
            raise ForbiddenError(f"Requires one of roles: {', '.join(roles)}")
        return current_user
    return role_dependency

require_citizen = require_roles("CITIZEN")
require_officer = require_roles("OFFICER")
require_dept_admin = require_roles("DEPARTMENT_ADMIN")
require_super_admin = require_roles("SUPER_ADMIN")
