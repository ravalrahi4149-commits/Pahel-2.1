from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from app.database import get_db
from app.schemas.auth import UserResponse
from app.schemas.user import UserPatchRequest
from app.models.user import User
from app.dependencies import require_super_admin, get_current_active_user
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/users", tags=["users"])

@router.get("", response_model=List[UserResponse])
async def get_users(role: Optional[str] = None, db: AsyncSession = Depends(get_db), _=Depends(require_super_admin)):
    stmt = select(User)
    if role:
        stmt = stmt.where(User.role == role)
    res = await db.execute(stmt)
    return list(res.scalars().all())

@router.patch("/{id}", response_model=UserResponse)
async def update_user(id: str, payload: UserPatchRequest, db: AsyncSession = Depends(get_db), _=Depends(require_super_admin)):
    stmt = select(User).where(User.id == id)
    res = await db.execute(stmt)
    user = res.scalars().first()
    if not user:
        raise NotFoundError("User not found")
    user.is_active = payload.is_active
    await db.commit()
    await db.refresh(user)
    return user
