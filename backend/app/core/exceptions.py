"""
Custom application exceptions + global FastAPI exception handlers.

Using typed exceptions (instead of raising HTTPException everywhere)
keeps business logic in services/ decoupled from HTTP concerns.
Handlers here translate them into consistent JSON error responses.
"""

import logging

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


class AppException(Exception):
    """Base class for all predictable, handled application errors."""

    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class NotFoundError(AppException):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status.HTTP_404_NOT_FOUND)


class UnauthorizedError(AppException):
    def __init__(self, message: str = "Not authenticated"):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED)


class ForbiddenError(AppException):
    def __init__(self, message: str = "You do not have permission to perform this action"):
        super().__init__(message, status.HTTP_403_FORBIDDEN)


class ConflictError(AppException):
    def __init__(self, message: str = "Resource already exists"):
        super().__init__(message, status.HTTP_409_CONFLICT)


def register_exception_handlers(app: FastAPI) -> None:
    """Attach all global exception handlers to the FastAPI app instance."""

    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
        logger.warning("Handled AppException on %s: %s", request.url.path, exc.message)
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        logger.info("Validation error on %s: %s", request.url.path, exc.errors())
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": "Validation error", "errors": exc.errors()},
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled exception on %s", request.url.path)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )
