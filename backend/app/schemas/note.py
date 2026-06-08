# FILE NAME: d:\Omkar\Water\FDA\backend\app\schemas\note.py

from pydantic import BaseModel
from datetime import datetime

class NoteBase(BaseModel):
    content: str

class NoteCreate(NoteBase):
    pass

class NoteResponse(NoteBase):
    id: int
    complaint_id: int
    officer_id: int
    created_at: datetime

    class Config:
        from_attributes = True
