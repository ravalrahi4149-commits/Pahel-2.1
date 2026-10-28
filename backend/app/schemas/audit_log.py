from pydantic import BaseModel, ConfigDict
from datetime import datetime
from pydantic.alias_generators import to_camel

class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True, alias_generator=to_camel)

class AuditLogResponse(BaseSchema):
    id: str
    timestamp: datetime
    user_id: str
    user_name: str
    user_role: str
    action: str
    entity: str
    entity_id: str
    description: str
