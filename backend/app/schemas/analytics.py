
from pydantic import BaseModel


class AnalyticsOverviewResponse(BaseModel):
    total_conversations: int
    total_messages: int
    user_messages: int
    assistant_messages: int
