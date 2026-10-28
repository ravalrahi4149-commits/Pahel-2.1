from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from app.database import get_db
from app.schemas.analytics import OfficerResponse
from app.models.user import User
from app.models.department import Department
from app.dependencies import get_current_active_user

router = APIRouter(prefix="/officers", tags=["officers"])

@router.get("", response_model=List[OfficerResponse])
async def get_officers(
    departmentId: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_active_user)
):
    stmt = select(User).where(User.role == "OFFICER")
    if departmentId:
        stmt = stmt.where(User.department_id == departmentId)
        
    res = await db.execute(stmt)
    users = res.scalars().all()
    
    officers = []
    for u in users:
        officers.append({
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "department_id": u.department_id or "",
            "department_name": u.department.name if u.department else "",
            "active_complaints": 0,
            "resolved_complaints": 0,
            "avg_resolution_hours": 0.0,
            "is_active": u.is_active
        })
    return officers
