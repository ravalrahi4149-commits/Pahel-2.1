from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.analytics import SystemStatsResponse
from app.services.analytics_service import get_system_stats
from app.dependencies import require_super_admin

router = APIRouter(prefix="/system", tags=["system"])

@router.get("/stats", response_model=SystemStatsResponse, dependencies=[Depends(require_super_admin)])
async def system_stats(db: AsyncSession = Depends(get_db)):
    return await get_system_stats(db)
