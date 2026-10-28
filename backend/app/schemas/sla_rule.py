from pydantic import BaseModel, ConfigDict
from typing import Optional
from pydantic.alias_generators import to_camel

class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True, alias_generator=to_camel)

class SLARuleResponse(BaseSchema):
    priority: str
    resolution_hours: int
    first_response_hours: int
    escalation_hours: int
    escalate_to: str

class SLARulePatch(BaseSchema):
    resolution_hours: Optional[int] = None
    first_response_hours: Optional[int] = None
    escalation_hours: Optional[int] = None
    escalate_to: Optional[str] = None
