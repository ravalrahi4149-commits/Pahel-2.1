from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.auth import (
    LoginRequest, RegisterRequest, AuthResponse,
    RefreshRequest, ForgotPasswordRequest, ResetPasswordRequest
)
from app.services.auth_service import (
    authenticate_user, create_user, save_refresh_token,
    validate_refresh_token, revoke_refresh_token,
    create_password_reset_token, reset_password
)
from app.core.security import create_access_token, create_refresh_token
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(db, req.email, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user.id, "role": user.role})
    refresh_token = create_refresh_token(data={"sub": user.id})
    
    from datetime import datetime, timedelta, timezone
    from app.config import get_settings
    settings = get_settings()
    expires = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    await save_refresh_token(db, user.id, refresh_token, expires)
    
    return {
        "user": user,
        "tokens": {
            "access_token": access_token,
            "refresh_token": refresh_token
        }
    }

@router.post("/register", response_model=AuthResponse)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    from sqlalchemy.future import select
    stmt = select(User).where(User.email == req.email)
    res = await db.execute(stmt)
    if res.scalars().first():
        raise HTTPException(status_code=409, detail="Email already registered")
        
    user = await create_user(db, req)
    
    access_token = create_access_token(data={"sub": user.id, "role": user.role})
    refresh_token = create_refresh_token(data={"sub": user.id})
    
    from datetime import datetime, timedelta, timezone
    from app.config import get_settings
    settings = get_settings()
    expires = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    await save_refresh_token(db, user.id, refresh_token, expires)
    
    return {
        "user": user,
        "tokens": {
            "access_token": access_token,
            "refresh_token": refresh_token
        }
    }

@router.post("/logout")
async def logout(req: RefreshRequest, db: AsyncSession = Depends(get_db)):
    await revoke_refresh_token(db, req.refresh_token)
    return {"message": "Logged out successfully"}

@router.post("/refresh", response_model=AuthResponse)
async def refresh(req: RefreshRequest, db: AsyncSession = Depends(get_db)):
    user = await validate_refresh_token(db, req.refresh_token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
        
    await revoke_refresh_token(db, req.refresh_token)
    
    access_token = create_access_token(data={"sub": user.id, "role": user.role})
    new_refresh = create_refresh_token(data={"sub": user.id})
    
    from datetime import datetime, timedelta, timezone
    from app.config import get_settings
    settings = get_settings()
    expires = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    await save_refresh_token(db, user.id, new_refresh, expires)
    
    return {
        "user": user,
        "tokens": {
            "access_token": access_token,
            "refresh_token": new_refresh
        }
    }

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    token = await create_password_reset_token(db, req.email)
    return {"message": "If email exists, reset instructions sent"}

@router.post("/reset-password")
async def reset_password_endpoint(req: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    success = await reset_password(db, req.token, req.password)
    if not success:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    return {"message": "Password reset successful"}
