from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.analytics import AnalyticsResponse
from app.services.analytics_service import get_analytics
from app.dependencies import get_current_active_user

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("", response_model=AnalyticsResponse)
async def analytics(departmentId: str = None, db: AsyncSession = Depends(get_db), _=Depends(get_current_active_user)):
    return await get_analytics(db, departmentId)
