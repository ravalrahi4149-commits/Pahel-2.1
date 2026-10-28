import logging
import time
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from app.config import get_settings

settings = get_settings()

logging.basicConfig(
    level=settings.LOG_LEVEL,
    format='{"time": "%(asctime)s", "name": "%(name)s", "level": "%(levelname)s", "message": "%(message)s"}'
)

def get_logger(name: str):
    return logging.getLogger(name)

logger = get_logger(__name__)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        logger.info(
            f'Request {request.method} {request.url.path} completed with status {response.status_code} in {process_time:.4f}s'
        )
        return response
