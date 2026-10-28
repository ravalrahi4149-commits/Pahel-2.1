from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from pydantic.alias_generators import to_camel

class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True, alias_generator=to_camel)

class NotificationResponse(BaseSchema):
    id: str
    user_id: str
    type: str
    title: str
    message: str
    complaint_id: Optional[str] = None
    read: bool
    created_at: datetime
