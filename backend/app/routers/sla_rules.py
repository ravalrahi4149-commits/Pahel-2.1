from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.database import get_db
from app.schemas.sla_rule import SLARuleResponse, SLARulePatch
from app.models.sla_rule import SLARule
from app.dependencies import require_super_admin, get_current_active_user
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/sla-rules", tags=["sla-rules"])

@router.get("", response_model=List[SLARuleResponse])
async def get_sla_rules(db: AsyncSession = Depends(get_db), _=Depends(get_current_active_user)):
    stmt = select(SLARule)
    res = await db.execute(stmt)
    return list(res.scalars().all())

@router.patch("/{priority}", response_model=SLARuleResponse, dependencies=[Depends(require_super_admin)])
async def update_sla_rule(priority: str, payload: SLARulePatch, db: AsyncSession = Depends(get_db)):
    stmt = select(SLARule).where(SLARule.priority == priority)
    res = await db.execute(stmt)
    rule = res.scalars().first()
    if not rule:
        raise NotFoundError("SLA rule not found")
        
    if payload.resolution_hours is not None:
        rule.resolution_hours = payload.resolution_hours
    if payload.first_response_hours is not None:
        rule.first_response_hours = payload.first_response_hours
    if payload.escalation_hours is not None:
        rule.escalation_hours = payload.escalation_hours
    if payload.escalate_to is not None:
        rule.escalate_to = payload.escalate_to

    await db.commit()
    await db.refresh(rule)
    return rule
