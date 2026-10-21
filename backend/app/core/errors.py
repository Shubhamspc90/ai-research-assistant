import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("backend.api")


def register_exception_handlers(app: FastAPI) -> None:
    """Register consistent, safe API exception handlers."""

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(
        request: Request,
        exc: StarletteHTTPException,
    ) -> JSONResponse:
        # Handle HTTP errors and preserve their status code, message, and headers.
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers=exc.headers,
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request,
        exc: RequestValidationError,
    ) -> JSONResponse:
        # Return a 422 response with field-level validation error details.
        return JSONResponse(
            status_code=422,
            content={
                "detail": "Request validation failed.",
                "errors": exc.errors(),
            },
        )

    @app.exception_handler(Exception)
    async def unexpected_exception_handler(
        request: Request,
        exc: Exception,
    ) -> JSONResponse:
        # Log unexpected exceptions without exposing internal error details to clients.
        logger.error(
            "Unhandled application exception",
            exc_info=(type(exc), exc, exc.__traceback__),
            extra={
                "method": request.method,
                "path": request.url.path,
            },
        )

        # Return a generic 500 response to avoid leaking sensitive implementation details.
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error."},
        )