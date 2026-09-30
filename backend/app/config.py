import os

from dotenv import load_dotenv

load_dotenv()

OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gpt-oss:20b-cloud")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "https://ollama.com")

DATABASE_URL = os.getenv("DATABASE_URL")

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
)

if not OLLAMA_API_KEY:
    raise ValueError("OLLAMA_API_KEY is not set.")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set.")

if not JWT_SECRET_KEY:
    raise ValueError("JWT_SECRET_KEY is not set.")