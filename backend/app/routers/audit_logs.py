from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.database import get_db
from app.schemas.audit_log import AuditLogResponse
from app.models.audit_log import AuditLog
from app.dependencies import require_super_admin

router = APIRouter(prefix="/audit-logs", tags=["audit-logs"])

@router.get("", response_model=List[AuditLogResponse], dependencies=[Depends(require_super_admin)])
async def get_audit_logs(db: AsyncSession = Depends(get_db)):
    stmt = select(AuditLog)
    res = await db.execute(stmt)
    return list(res.scalars().all())
