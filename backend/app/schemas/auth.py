from pydantic import BaseModel, ConfigDict, Field, EmailStr
from typing import Optional
from pydantic.alias_generators import to_camel
from datetime import datetime

class BaseSchema(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        alias_generator=to_camel
    )

class LoginRequest(BaseSchema):
    email: str
    password: str

class RegisterRequest(BaseSchema):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str = Field(min_length=6)

class ForgotPasswordRequest(BaseSchema):
    email: EmailStr

class ResetPasswordRequest(BaseSchema):
    token: str
    password: str = Field(min_length=6)

class TokenResponse(BaseSchema):
    access_token: str
    refresh_token: str

class UserResponse(BaseSchema):
    id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    role: str
    department_id: Optional[str] = None
    is_active: bool
    created_at: datetime

class AuthResponse(BaseSchema):
    user: UserResponse
    tokens: TokenResponse

class RefreshRequest(BaseSchema):
    refresh_token: str
