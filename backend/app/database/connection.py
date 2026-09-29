from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.config import DATABASE_URL


engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)

# This gives us:

# FastAPI
#    ↓
# SQLAlchemy
#    ↓
# Psycopg
#    ↓
# PostgreSQL 18
#    ↓
# ai_research_assistant