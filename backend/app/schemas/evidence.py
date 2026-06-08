# FILE NAME: d:\Omkar\Water\FDA\backend\app\schemas\evidence.py

from pydantic import BaseModel
from datetime import datetime

class EvidenceBase(BaseModel):
    file_url: str

class EvidenceCreate(EvidenceBase):
    complaint_id: int

class EvidenceResponse(EvidenceBase):
    id: int
    complaint_id: int
    uploaded_at: datetime

    class Config:
        from_attributes = True
