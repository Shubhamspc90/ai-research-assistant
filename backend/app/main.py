from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.agents import research_agent
from backend.app.schemas.chat import ChatRequest, ChatResponse


app = FastAPI(
    title="AI Research Assistant API",
    description="Backend API for the AI Research Assistant.",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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