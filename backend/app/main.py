import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from backend.app.agents import research_agent
from backend.app.schemas.chat import ChatRequest, ChatResponse


app = FastAPI(
    title="AI Research Assistant API",
    description="Backend API for the AI Research Assistant.",
    version="0.1.0",
)


# --------------------------------------------------
# CORS Configuration
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Root Endpoint
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "AI Research Assistant API is running"
    }


# --------------------------------------------------
# Health Check Endpoint
# --------------------------------------------------

@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


# --------------------------------------------------
# Normal Chat Endpoint
# --------------------------------------------------

@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    result = research_agent.invoke(
        {
            "messages": [
                {
                    "role": "user",
                    "content": request.message,
                }
            ]
        }
    )

    response = result["messages"][-1].content

    return ChatResponse(response=response)


# --------------------------------------------------
# Streaming Chat Endpoint
# --------------------------------------------------

@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):

    async def generate():
        try:
            async for message_chunk, metadata in research_agent.astream(
                {
                    "messages": [
                        {
                            "role": "user",
                            "content": request.message,
                        }
                    ]
                },
                stream_mode="messages",
            ):
                # Get text from the streamed message chunk
                text = message_chunk.text

                if text:
                    data = {
                        "type": "token",
                        "content": text,
                    }

                    yield f"data: {json.dumps(data)}\n\n"

            # Tell frontend that streaming is complete
            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        except Exception as exc:
            error_data = {
                "type": "error",
                "message": str(exc),
            }

            yield f"data: {json.dumps(error_data)}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )