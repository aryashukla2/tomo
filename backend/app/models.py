from sqlalchemy import Column, DateTime, Integer, String, Boolean, ForeignKey, Date, func
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime, timezone, date

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=False)
    step = Column(String, nullable=True)
    mood = Column(String, nullable=True)
    is_chunked = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    chunks = relationship("Chunk", back_populates="task")
    created_at = Column(DateTime, default=func.now())

class Chunk(Base):
    __tablename__ = "chunks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    status = Column(String, default="not_started")  # or enum
    task_id = Column(Integer, ForeignKey("tasks.id"))
    task = relationship("Task", back_populates="chunks")

class FocusSession(Base):
    __tablename__ = "focus_sessions"

    id = Column(Integer, primary_key=True, index=True)
    task_title = Column(String, nullable=False)       # Store title in case task is deleted
    chunk_title = Column(String, nullable=True)        # Optional: Only for chunked sessions
    duration = Column(Integer, nullable=False)         # Duration in minutes
    xp_earned = Column(Integer, nullable=False, default=0)
    mood = Column(String, nullable=True)               # e.g., "tired", "focused", etc.
    created_at = Column(DateTime, default=func.now())

class UserStats(Base):
    __tablename__ = "user_stats"
    id = Column(Integer, primary_key=True, index=True)
    total_xp = Column(Integer, default=0)
    current_level = Column(Integer, default=1)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_active_date = Column(Date, default=date.today)