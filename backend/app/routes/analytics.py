
from fastapi import APIRouter, Depends
from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from backend.app.auth.dependencies import get_current_user
from backend.app.database.dependencies import get_db
from backend.app.models import Conversation, Message, User
from backend.app.schemas.analytics import AnalyticsOverviewResponse


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


@router.get(
    "/overview",
    response_model=AnalyticsOverviewResponse,
)
def get_analytics_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return usage statistics for the authenticated user."""

    total_conversations = db.scalar(
        select(func.count(Conversation.id)).where(
            Conversation.user_id == current_user.id
        )
    ) or 0

    message_stats = db.execute(
        select(
            func.count(Message.id).label("total_messages"),
            func.coalesce(
                func.sum(
                    case(
                        (Message.role == "user", 1),
                        else_=0,
                    )
                ),
                0,
            ).label("user_messages"),
            func.coalesce(
                func.sum(
                    case(
                        (Message.role == "assistant", 1),
                        else_=0,
                    )
                ),
                0,
            ).label("assistant_messages"),
        )
        .join(
            Conversation,
            Message.conversation_id == Conversation.id,
        )
        .where(Conversation.user_id == current_user.id)
    ).one()

    return AnalyticsOverviewResponse(
        total_conversations=total_conversations,
        total_messages=message_stats.total_messages,
        user_messages=message_stats.user_messages,
        assistant_messages=message_stats.assistant_messages,
    )
