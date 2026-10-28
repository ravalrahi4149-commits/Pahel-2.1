from pydantic import BaseModel, ConfigDict
from typing import List
from pydantic.alias_generators import to_camel

class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True, alias_generator=to_camel)

class DepartmentCreate(BaseSchema):
    name: str
    code: str
    head: str
    categories_handled: List[str]

class DepartmentResponse(BaseSchema):
    id: str
    name: str
    code: str
    head: str
    officer_count: int
    total_complaints: int
    resolved_complaints: int
    sla_compliance: float
    categories_handled: List[str]
