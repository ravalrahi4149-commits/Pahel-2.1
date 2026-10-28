from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.database import get_db
from app.schemas.complaint import ComplaintResponse, ComplaintCreate, StatusUpdateRequest, RemarkRequest
from app.services.complaint_service import list_complaints, get_complaint, create_complaint, update_status, add_remark
from app.dependencies import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/complaints", tags=["complaints"])

@router.get("", response_model=List[ComplaintResponse])
async def read_complaints(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    citizenId: Optional[str] = None,
    officerId: Optional[str] = None,
    departmentId: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return await list_complaints(
        db, current_user, 
        status=status, priority=priority, category=category,
        search=search, citizen_id=citizenId, officer_id=officerId, department_id=departmentId
    )

@router.post("", response_model=ComplaintResponse)
async def create_new_complaint(
    payload: ComplaintCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return await create_complaint(db, payload, current_user)

@router.get("/{id}", response_model=ComplaintResponse)
async def read_complaint(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return await get_complaint(db, id, current_user)

@router.patch("/{id}/status", response_model=ComplaintResponse)
async def update_complaint_status(
    id: str,
    payload: StatusUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return await update_status(db, id, payload.status, payload.remarks, current_user)

@router.post("/{id}/remarks", response_model=ComplaintResponse)
async def add_complaint_remark(
    id: str,
    payload: RemarkRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return await add_remark(db, id, payload.remark, current_user)
