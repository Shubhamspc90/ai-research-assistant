from fastapi import FastAPI

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