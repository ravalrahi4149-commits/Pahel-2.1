from __future__ import annotations

from pydantic import BaseModel, ConfigDict, model_validator
from pydantic.alias_generators import to_camel
from typing import Optional, List, Any
from datetime import datetime


class BaseSchema(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        alias_generator=to_camel,
    )


class LocationSchema(BaseSchema):
    address: str
    lat: float
    lng: float
    ward: Optional[str] = None
    city: Optional[str] = None


class EvidenceSchema(BaseSchema):
    id: str
    url: str
    name: str
    type: str  # "image" | "document"


class AIAnalysisSchema(BaseSchema):
    category: str
    confidence: float
    priority: str
    urgency_score: float
    reason: str
    recommended_department_id: str
    recommended_department_name: str
    duplicate_probability: float
    similar_complaint_ids: List[str]
    keywords: List[str]
    sentiment: str
    analyzed_at: datetime


class TimelineEventSchema(BaseSchema):
    id: str
    status: str
    actor: str
    actor_role: str
    description: str
    timestamp: datetime


class ComplaintCreate(BaseSchema):
    title: str
    description: str
    location: LocationSchema
    evidence: Optional[List[EvidenceSchema]] = None
    ai_analysis: Optional[AIAnalysisSchema] = None
    citizen_id: Optional[str] = None
    category: str
    priority: str


class ComplaintResponse(BaseSchema):
    id: str
    code: str
    title: str
    description: str
    category: str
    priority: str
    status: str
    location: LocationSchema
    evidence: List[EvidenceSchema] = []
    citizen_id: str
    citizen_name: str
    department_id: Optional[str] = None
    department_name: Optional[str] = None
    officer_id: Optional[str] = None
    officer_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    expected_resolution_at: datetime
    resolved_at: Optional[datetime] = None
    sla_status: str
    ai_analysis: Optional[AIAnalysisSchema] = None
    duplicate_group_id: Optional[str] = None
    timeline: List[TimelineEventSchema] = []
    remarks: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def build_nested(cls, values: Any) -> Any:
        if isinstance(values, dict):
            return values

        obj = values
        location = {
            "address": getattr(obj, "location_address", ""),
            "lat": getattr(obj, "location_lat", 0.0),
            "lng": getattr(obj, "location_lng", 0.0),
            "ward": getattr(obj, "location_ward", None),
            "city": getattr(obj, "location_city", None),
        }

        evidence_rel = getattr(obj, "evidence", []) or []
        evidence = [
            {
                "id": e.id,
                "url": e.url,
                "name": e.name,
                "type": e.type,
            }
            for e in evidence_rel
        ]

        ai_rel = getattr(obj, "ai_analysis", None)
        ai_analysis = None
        if ai_rel:
            ai_analysis = {
                "category": ai_rel.category,
                "confidence": ai_rel.confidence,
                "priority": ai_rel.priority,
                "urgency_score": ai_rel.urgency_score,
                "reason": ai_rel.reason,
                "recommended_department_id": ai_rel.recommended_department_id,
                "recommended_department_name": ai_rel.recommended_department_name,
                "duplicate_probability": ai_rel.duplicate_probability,
                "similar_complaint_ids": ai_rel.similar_complaint_ids or [],
                "keywords": ai_rel.keywords or [],
                "sentiment": ai_rel.sentiment,
                "analyzed_at": ai_rel.analyzed_at,
            }

        timeline_rel = getattr(obj, "timeline", []) or []
        timeline = [
            {
                "id": t.id,
                "status": t.status,
                "actor": t.actor,
                "actor_role": t.actor_role,
                "description": t.description,
                "timestamp": t.timestamp,
            }
            for t in timeline_rel
        ]

        return {
            "id": obj.id,
            "code": obj.code,
            "title": obj.title,
            "description": obj.description,
            "category": obj.category,
            "priority": obj.priority,
            "status": obj.status,
            "location": location,
            "evidence": evidence,
            "citizen_id": obj.citizen_id,
            "citizen_name": obj.citizen_name,
            "department_id": getattr(obj, "department_id", None),
            "department_name": getattr(obj, "department_name", None),
            "officer_id": getattr(obj, "officer_id", None),
            "officer_name": getattr(obj, "officer_name", None),
            "created_at": obj.created_at,
            "updated_at": obj.updated_at,
            "expected_resolution_at": obj.expected_resolution_at,
            "resolved_at": getattr(obj, "resolved_at", None),
            "sla_status": obj.sla_status,
            "ai_analysis": ai_analysis,
            "duplicate_group_id": getattr(obj, "duplicate_group_id", None),
            "timeline": timeline,
            "remarks": getattr(obj, "remarks", None),
        }


class StatusUpdateRequest(BaseSchema):
    status: str
    remarks: Optional[str] = None


class RemarkRequest(BaseSchema):
    remark: str
