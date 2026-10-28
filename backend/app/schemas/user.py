from pydantic import BaseModel, ConfigDict
from typing import Optional
from pydantic.alias_generators import to_camel

class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True, alias_generator=to_camel)

class UserPatchRequest(BaseSchema):
    is_active: bool
