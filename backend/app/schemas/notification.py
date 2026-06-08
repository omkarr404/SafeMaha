# FILE NAME: d:\Omkar\Water\FDA\backend\app\schemas\notification.py

from pydantic import BaseModel, Field, model_validator
from datetime import datetime
from typing import Optional

class TranslationSchema(BaseModel):
    en: str
    mr: str

class NotificationCreate(BaseModel):
    id: Optional[str] = None
    complaintId: Optional[str] = None
    mobile: str
    title: TranslationSchema
    description: TranslationSchema
    date: Optional[datetime] = None
    read: Optional[bool] = False

class NotificationResponse(BaseModel):
    id: str
    complaintId: Optional[str] = None
    mobile: str
    title: TranslationSchema
    description: TranslationSchema
    date: datetime
    read: bool

    @model_validator(mode="before")
    @classmethod
    def map_db_to_frontend(cls, data):
        if hasattr(data, "id"):
            return {
                "id": data.id,
                "complaintId": data.complaint_id,
                "mobile": data.mobile,
                "title": {
                    "en": data.title_en,
                    "mr": data.title_mr
                },
                "description": {
                    "en": data.description_en,
                    "mr": data.description_mr
                },
                "date": data.created_at,
                "read": data.is_read
            }
        return data

    class Config:
        from_attributes = True
