from fastapi import FastAPI

from backend.app.agents import research_agent
from backend.app.schemas.chat import ChatRequest, ChatResponse


app = FastAPI(
    title="AI Research Assistant API",
    description="Backend API for the AI Research Assistant.",
    version="0.1.0",
)


@app.get("/")
def root():
    return {
        "message": "AI Research Assistant API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


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