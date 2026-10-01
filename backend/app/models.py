from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


# =========================================================
# ANALYSIS
# =========================================================

class Analysis(Base):

    __tablename__ = "analyses"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    code: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    language: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    issues: Mapped[list] = mapped_column(
        JSON,
        default=list,
    )

    complexity: Mapped[dict] = mapped_column(
        JSON,
        default=dict,
    )

    secure_code: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    chat_messages = relationship(
        "ChatMessage",
        back_populates="analysis",
        cascade="all, delete-orphan",
    )


# =========================================================
# CHAT MESSAGE
# =========================================================

class ChatMessage(Base):

    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    analysis_id: Mapped[int] = mapped_column(
        ForeignKey("analyses.id"),
        nullable=False,
    )

    vulnerability_id: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    role: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    analysis = relationship(
        "Analysis",
        back_populates="chat_messages",
    )