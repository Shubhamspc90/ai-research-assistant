from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

from backend.app.core.errors import register_exception_handlers


def create_test_app() -> FastAPI:
    # Create a small FastAPI app for testing the exception handlers.
    app = FastAPI()

    # Register the custom exception handlers under test.
    register_exception_handlers(app)

    @app.get("/http-error")
    def http_error():
        # Endpoint that raises a 401 HTTP error with a custom header.
        raise HTTPException(
            status_code=401,
            detail="Authentication required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    @app.get("/items/{item_id}")
    def get_item(item_id: int):
        # Endpoint that requires item_id to be a valid integer.
        return {"item_id": item_id}

    return app


def test_http_exception_preserves_status_detail_and_headers():
    # Verify that HTTPException keeps its status code, detail, and headers.
    client = TestClient(create_test_app())

    # Call the endpoint that raises a 401 error.
    response = client.get("/http-error")

    # Confirm the response uses the original 401 status code.
    assert response.status_code == 401

    # Confirm the response body contains the original error detail.
    assert response.json() == {
        "detail": "Authentication required."
    }

    # Confirm the custom authentication header is preserved.
    assert response.headers["WWW-Authenticate"] == "Bearer"


def test_validation_error_returns_consistent_response():
    # Verify that invalid path parameters return a consistent 422 response.
    client = TestClient(create_test_app())

    # Send a non-integer value where an integer is required.
    response = client.get("/items/not-an-integer")

    # Confirm FastAPI validation failures return HTTP 422.
    assert response.status_code == 422

    # Read the JSON response body for detailed assertions.
    body = response.json()

    # Confirm the response uses the standardized error message.
    assert body["detail"] == "Request validation failed."

    # Confirm validation errors are returned as a non-empty list.
    assert isinstance(body["errors"], list)
    assert body["errors"]

import json

from unittest.mock import patch

from fastapi.testclient import TestClient

from backend.app.main import app



def test_streaming_error_does_not_expose_exception_details():
    from unittest.mock import patch

    from fastapi.testclient import TestClient

    from backend.app.main import app
    from backend.app.auth.dependencies import get_current_user

    secret_detail = "internal-secret-diagnostic"

    async def failing_stream(*args, **kwargs):
        raise RuntimeError(secret_detail)
        yield

    # Bypass authentication so the test reaches the streaming endpoint.
    app.dependency_overrides[get_current_user] = lambda: {
        "id": 1,
        "username": "test-user",
    }

    try:
        with patch(
            "backend.app.main.research_agent.astream",
            side_effect=failing_stream,
        ):
            client = TestClient(app)
            response = client.post(
                "/chat/stream",
                json={"message": "Test message"},
            )

        assert response.status_code == 200
        assert secret_detail not in response.text
        assert "temporarily unavailable" in response.text
        assert '"type": "error"' in response.text
    finally:
        app.dependency_overrides.pop(get_current_user, None)
