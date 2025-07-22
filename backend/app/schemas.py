from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ChunkBase(BaseModel):
    title: str
    status: Optional[str] = "not_started"

class ChunkCreate(ChunkBase): pass
class Chunk(ChunkBase):
    id: int
    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    title: str
    is_chunked: Optional[bool] = False
    is_archived: Optional[bool] = False

class TaskCreate(TaskBase): pass
class Task(TaskBase):
    id: int
    chunks: List[Chunk] = []
    class Config:
        from_attributes = True

class FocusSessionBase(BaseModel):
    task_title: str
    chunk_title: Optional[str] = None
    duration: int
    xp_earned: int
    mood: Optional[str] = None

class FocusSessionCreate(FocusSessionBase):
    pass

class FocusSession(FocusSessionBase):
    id: int
    timestamp: datetime
    class Config:
        from_attributes = True