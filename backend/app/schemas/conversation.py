from datetime import datetime

from pydantic import BaseModel, Field
from backend.app.schemas.message import MessageResponse


class ConversationCreate(BaseModel):
    title: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )


class ConversationResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }
    
class ConversationDetailResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime
    messages: list["MessageResponse"]

    model_config = {
        "from_attributes": True,
    }