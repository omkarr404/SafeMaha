# FILE NAME: d:\Omkar\Water\FDA\backend\app\schemas\officer.py

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

class OfficerBase(BaseModel):
    name: str
    email: str
    mobile: str
    district: str
    role: str
    is_active: Optional[bool] = True

class OfficerCreate(OfficerBase):
    pass

class OfficerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    mobile: Optional[str] = None
    district: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class OfficerResponse(OfficerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
