"""
ASGIP FastAPI Application Entry Point
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings

# Import all models BEFORE create_tables so Base.metadata is populated
import app.models  # noqa: F401

from app.database import create_tables
from app.core.logging import RequestLoggingMiddleware, get_logger
from app.core.exceptions import setup_exception_handlers

# Routers
from app.routers import (
    auth,
    complaints,
    departments,
    officers,
    users,
    notifications,
    sla_rules,
    audit_logs,
    analytics,
    system,
    ai,
)

settings = get_settings()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create all DB tables on startup."""
    logger.info("Starting ASGIP API...")
    await create_tables()
    logger.info("Database tables ready.")
    yield
    logger.info("Shutting down ASGIP API.")


app = FastAPI(
    title="ASGIP API",
    version="1.0.0",
    description=(
        "## AI-Powered Smart Grievance Intelligence Platform\n\n"
        "Production-ready REST API for the ASGIP civic complaint management system.\n\n"
        "### Authentication\n"
        "Use `POST /auth/login` to obtain `accessToken` and `refreshToken`. "
        "Pass `accessToken` as `Bearer <token>` in the `Authorization` header.\n\n"
        "### Roles\n"
        "- **CITIZEN** — submit and track own complaints\n"
        "- **OFFICER** — manage assigned complaints\n"
        "- **DEPARTMENT_ADMIN** — oversee department operations\n"
        "- **SUPER_ADMIN** — full system access\n"
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Middleware (order matters: CORS must wrap everything)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestLoggingMiddleware)

# Exception handlers
setup_exception_handlers(app)

# Routers
app.include_router(auth.router)
app.include_router(complaints.router)
app.include_router(departments.router)
app.include_router(officers.router)
app.include_router(users.router)
app.include_router(notifications.router)
app.include_router(sla_rules.router)
app.include_router(audit_logs.router)
app.include_router(analytics.router)
app.include_router(system.router)
app.include_router(ai.router)


@app.get("/", tags=["health"])
async def health_check():
    """API health check."""
    return {"status": "ok", "version": "1.0.0", "service": "ASGIP API"}
