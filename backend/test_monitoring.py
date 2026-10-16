import logging  # Import logging module to handle log captures and messages

from fastapi import FastAPI, HTTPException  # Import FastAPI framework and HTTPException for error responses
from fastapi.testclient import TestClient     # Import TestClient to simulate HTTP requests in tests

from backend.app.core.monitoring import RequestMonitoringMiddleware  # Import custom request monitoring middleware


def create_test_app() -> FastAPI:
    app = FastAPI()                          # Initialize a new FastAPI application instance for testing
    app.add_middleware(RequestMonitoringMiddleware)  # Register the monitoring middleware to the test app

    @app.get("/health")
    def health():
        return {"status": "healthy"}         # Simple health check endpoint returning a success status dictionary

    @app.get("/error")
    def error():
        raise HTTPException(                 # Explicitly raise a FastAPI HTTP exception with a 400 status code
            status_code=400,
            detail="Bad request",
        )

    return app                               # Return the configured FastAPI test application instance


def test_request_returns_request_id():
    client = TestClient(create_test_app())   # Initialize the test client using the test FastAPI app

    response = client.get("/health")         # Send a GET request to the /health endpoint

    assert response.status_code == 200       # Verify that the response status code is 200 OK
    assert response.json() == {"status": "healthy"}  # Verify the JSON response body content
    assert response.headers.get("X-Request-ID")      # Verify that the X-Request-ID header is present in the response


def test_request_logs_status_and_duration(caplog):
    client = TestClient(create_test_app())   # Initialize the test client

    with caplog.at_level(logging.INFO, logger="backend.api"):  # Capture logs from the backend.api logger at INFO level
        response = client.get("/health")     # Send a GET request to the health endpoint

    assert response.status_code == 200       # Assert status code is 200
    assert any(                              # Verify that a completion log was recorded with correct attributes
        record.message == "API request completed"
        and record.status_code == 200
        and record.duration_ms >= 0
        for record in caplog.records
    )


def test_http_error_status_is_logged(caplog):
    client = TestClient(create_test_app())   # Initialize the test client

    with caplog.at_level(logging.INFO, logger="backend.api"):  # Capture logs from the specified logger
        response = client.get("/error")      # Send a GET request to the endpoint that raises an HTTP error

    assert response.status_code == 400       # Assert the response status code is 400 Bad Request
    assert any(                              # Verify that the request completion log captures the 400 status code
        record.message == "API request completed"
        and record.status_code == 400
        for record in caplog.records
    )


def test_unhandled_exception_is_logged(caplog):
    app = FastAPI()                          # Create a standalone FastAPI instance for testing unhandled errors
    app.add_middleware(RequestMonitoringMiddleware)  # Add the monitoring middleware

    @app.get("/unexpected-error")
    def unexpected_error():
        raise RuntimeError("Internal test failure")  # Raise an unexpected runtime exception

    # Return the server error response instead of re-raising it in TestClient.
    client = TestClient(app, raise_server_exceptions=False)  # Initialize client with exception raising disabled

    with caplog.at_level(logging.INFO, logger="backend.api"):  # Capture logs during the request
        response = client.get("/unexpected-error")  # Send GET request triggering the unhandled error

    assert response.status_code == 500       # Verify the response status code is 500 Internal Server Error
    assert response.headers.get("X-Request-ID")      # Verify the request ID header is still attached
    assert any(                              # Verify that a failure log was recorded
        record.message == "API request failed"
        and record.status_code == 500
        for record in caplog.records
    )
    assert any(                              # Verify that a completion log was also recorded for the failed request
        record.message == "API request completed"
        and record.status_code == 500
        for record in caplog.records
    )