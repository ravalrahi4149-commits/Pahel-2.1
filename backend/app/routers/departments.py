from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.database import get_db
from app.schemas.department import DepartmentResponse, DepartmentCreate
from app.models.department import Department
from app.dependencies import require_super_admin, get_current_active_user
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/departments", tags=["departments"])

@router.get("", response_model=List[DepartmentResponse])
async def get_departments(db: AsyncSession = Depends(get_db), _=Depends(get_current_active_user)):
    stmt = select(Department)
    res = await db.execute(stmt)
    return list(res.scalars().all())

@router.get("/{id}", response_model=DepartmentResponse)
async def get_department(id: str, db: AsyncSession = Depends(get_db), _=Depends(get_current_active_user)):
    stmt = select(Department).where(Department.id == id)
    res = await db.execute(stmt)
    dept = res.scalars().first()
    if not dept:
        raise NotFoundError("Department not found")
    return dept

@router.post("", response_model=DepartmentResponse, dependencies=[Depends(require_super_admin)])
async def create_department(payload: DepartmentCreate, db: AsyncSession = Depends(get_db)):
    dept = Department(
        name=payload.name,
        code=payload.code,
        head=payload.head,
        categories_handled=payload.categories_handled
    )
    db.add(dept)
    await db.commit()
    await db.refresh(dept)
    return dept
