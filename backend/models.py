from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=utcnow)
    sessions = relationship("AnalysisSession", back_populates="user")


class AnalysisSession(Base):
    """One analysis run (a video or a batch of text answers). Called 'Session' in the API contract."""
    __tablename__ = "sessions"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    kind = Column(String, nullable=False)          # "video" or "text"
    title = Column(String)
    summary_json = Column(Text)                    # small JSON summary, never raw video or answers
    created_at = Column(DateTime, default=utcnow)
    user = relationship("User", back_populates="sessions")
    events = relationship("Event", back_populates="session", cascade="all, delete-orphan")


class Event(Base):
    """A flagged moment (video) or a flagged pair of answers (text)."""
    __tablename__ = "events"
    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False, index=True)
    kind = Column(String, nullable=False)          # "video" or "text"
    label = Column(String)                         # e.g. looking_sideways, phone_use, similar_pair
    start_s = Column(Float)                        # video only
    end_s = Column(Float)                          # video only
    score = Column(Float)                          # confidence or similarity
    detail_json = Column(Text)                     # extra info (risk, student ids, matched sentences)
    review_status = Column(String, default="pending")   # pending, confirmed, dismissed
    session = relationship("AnalysisSession", back_populates="events")
