import logging  # Import logging module for recording events
import time     # Import time module to measure request duration
import uuid     # Import uuid module to generate unique request IDs

from starlette.middleware.base import BaseHTTPMiddleware  # Base class for Starlette middleware
from starlette.requests import Request                    # Request class for HTTP requests
from starlette.responses import JSONResponse, Response    # Response classes for HTTP responses

logger = logging.getLogger("backend.api")  # Initialize logger for the backend API module


class RequestMonitoringMiddleware(BaseHTTPMiddleware):
    """Log API request metadata without logging user content."""

    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = str(uuid.uuid4())                     # Generate a unique ID for tracking the request
        start_time = time.perf_counter()                   # Record the start time for performance tracking
        status_code = 500                                  # Default status code set to 500 in case of failure

        try:
            response = await call_next(request)            # Forward the request to the next application handler
            status_code = response.status_code             # Update status code from the actual response

        except Exception:
            logger.exception(                              # Log the full exception stack trace if an error occurs
                "API request failed",
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": status_code,
                },
            )

            response = JSONResponse(                       # Return a generic 500 JSON response on unhandled exceptions
                status_code=500,
                content={"detail": "Internal server error"},
            )

        finally:
            duration_ms = round(                           # Calculate total request duration in milliseconds
                (time.perf_counter() - start_time) * 1000, 2
            )

            logger.info(                                   # Log metadata and completion status of the request
                "API request completed",
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": status_code,
                    "duration_ms": duration_ms,
                },
            )

        response.headers["X-Request-ID"] = request_id      # Attach the unique request ID to the outgoing response headers
        return response                                    # Return the final response object