from backend.app.database.base import Base
from backend.app.models import Conversation, Message, User


print("Models loaded successfully.")
print("Tables:", list(Base.metadata.tables.keys()))