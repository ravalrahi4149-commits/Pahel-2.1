from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.database import get_db
from app.schemas.notification import NotificationResponse
from app.services.notification_service import list_for_user, mark_read
from app.dependencies import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("", response_model=List[NotificationResponse])
async def notifications(userId: Optional[str] = None, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    target_id = userId if userId and current_user.role == "SUPER_ADMIN" else current_user.id
    return await list_for_user(db, target_id)

@router.post("/{id}/read")
async def read_notification(id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    await mark_read(db, id, current_user.id)
    return {"message": "Notification marked as read"}
