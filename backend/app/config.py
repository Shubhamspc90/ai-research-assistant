import os

from dotenv import load_dotenv

load_dotenv()

OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gpt-oss:20b-cloud")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "https://ollama.com")

DATABASE_URL = os.getenv("DATABASE_URL")

if not OLLAMA_API_KEY:
    raise ValueError("OLLAMA_API_KEY is not set.")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set.")