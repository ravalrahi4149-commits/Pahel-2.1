from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.complaint import AIAnalysisSchema
from app.services.ai_service import analyze
from app.dependencies import get_current_active_user

router = APIRouter(prefix="/ai", tags=["ai"])

class AIAnalyzePayload(BaseModel):
    title: str
    description: str

@router.post("/analyze", response_model=AIAnalysisSchema)
async def analyze_complaint(payload: AIAnalyzePayload, db: AsyncSession = Depends(get_db), _=Depends(get_current_active_user)):
    return await analyze(payload.title, payload.description, db)
