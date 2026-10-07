from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.agents import research_agent
from backend.app.auth.dependencies import get_current_user
from backend.app.database.dependencies import get_db
from backend.app.models import Conversation, Message, User
from backend.app.schemas.chat import ChatRequest
from backend.app.schemas.message import MessageResponse


router = APIRouter(
    prefix="/conversations",
    tags=["Messages"],
)


@router.post(
    "/{conversation_id}/messages",
    response_model=list[MessageResponse],
    status_code=status.HTTP_201_CREATED,
)
def create_message(
    conversation_id: int,
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a user message, generate an AI response, and save both messages."""

    # Verify conversation ownership.
    conversation = db.scalar(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
    )

    if conversation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found.",
        )

    # Save the user's message.
    user_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=request.message,
    )

    db.add(user_message)
    db.flush()

    # Load previous conversation messages.
    messages = db.scalars(
        select(Message)
        .where(Message.conversation_id == conversation.id)
        .order_by(Message.created_at.asc())
    ).all()

    # Convert database messages into the format expected by the agent.
    conversation_messages = [
        {
            "role": message.role,
            "content": message.content,
        }
        for message in messages
    ]

    # Generate the AI response using the complete conversation history.
    try:
        result = research_agent.invoke(
            {
                "messages": conversation_messages,
            }
        )

        assistant_response = result["messages"][-1].content

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "AI service is temporarily unavailable. "
                "Please try again later."
            ),
        )

    # Save the assistant's response.
    assistant_message = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=assistant_response,
    )

    db.add(assistant_message)

    # Update the conversation's last activity timestamp.
    conversation.updated_at = datetime.utcnow()

    # Commit both messages and the conversation update.
    db.commit()

    db.refresh(user_message)
    db.refresh(assistant_message)

    return [
        user_message,
        assistant_message,
    ]


@router.get(
    "/{conversation_id}/messages",
    response_model=list[MessageResponse],
)
def list_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all messages belonging to a user's conversation."""

    # Verify conversation ownership.
    conversation = db.scalar(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
    )

    if conversation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found.",
        )

    # Fetch conversation messages in chronological order.
    messages = db.scalars(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
    ).all()

    return list(messages)