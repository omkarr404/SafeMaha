# FILE NAME: d:\Omkar\Water\FDA\backend\app\schemas\complaint.py

from pydantic import BaseModel, Field, model_validator
from datetime import datetime
from typing import Optional, List

class LocationSchema(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None

class ComplaintCreate(BaseModel):
    title: str
    category: str
    description: str
    name: Optional[str] = None  # Citizen name on form
    location: Optional[LocationSchema] = None
    evidence: Optional[List[str]] = Field(default_factory=list, description="List of evidence file URLs")
    priority: Optional[str] = "Low"
    district_id: Optional[int] = None
    taluka_id: Optional[int] = None


class NoteResponse(BaseModel):
    id: int
    author: str
    timestamp: datetime
    comment: str

    @model_validator(mode="before")
    @classmethod
    def map_db_to_frontend(cls, data):
        if hasattr(data, "id"):
            # It's an ORM model
            return {
                "id": data.id,
                "author": data.officer.phone_number if (data.officer and not getattr(data, "officer_name", None)) else "FDA Officer",
                "timestamp": data.created_at,
                "comment": data.content
            }
        return data

    class Config:
        from_attributes = True

class ComplaintResponse(BaseModel):
    id: str
    user_id: int
    title: str
    category: str
    description: str
    status: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    priority: Optional[str] = "Low"
    district_id: Optional[int] = None
    taluka_id: Optional[int] = None
    district_name: Optional[str] = ""
    taluka_name: Optional[str] = ""
    
    # Frontend compatibility fields
    name: Optional[str] = None          # Maps from citizen_name
    mobile: Optional[str] = None        # Maps from user.phone_number
    assignedOfficer: Optional[str] = None # Maps from assigned_officer
    createdAt: Optional[datetime] = None  # Maps from created_at
    evidence: List[str] = []             # Maps from evidences relation (file_urls)
    notes: List[NoteResponse] = []       # Maps from notes relation

    @model_validator(mode="before")
    @classmethod
    def map_db_to_frontend_complaint(cls, data):
        if hasattr(data, "id"):
            # Resolve phone number from relationship
            mobile_num = data.user.phone_number if data.user else ""
            
            # Resolve evidence URLs
            evidence_urls = [e.file_url for e in data.evidences] if data.evidences else []
            
            # Resolve notes mapped
            notes_mapped = []
            if data.notes:
                notes_mapped = [
                    {
                        "id": n.id,
                        "author": n.officer.phone_number if n.officer else "FDA Inspector",
                        "timestamp": n.created_at,
                        "comment": n.content
                    }
                    for n in data.notes
                ]

            return {
                "id": data.id,
                "user_id": data.user_id,
                "title": data.title,
                "category": data.category,
                "description": data.description,
                "status": data.status,
                "latitude": data.latitude,
                "longitude": data.longitude,
                "address": data.address,
                "created_at": data.created_at,
                "updated_at": data.updated_at,
                "priority": data.priority or "Low",
                "district_id": data.district_id,
                "taluka_id": data.taluka_id,
                "district_name": data.district.name if getattr(data, "district", None) else "",
                "taluka_name": data.taluka.name if getattr(data, "taluka", None) else "",
                "name": data.citizen_name or "Anonymous",
                "mobile": mobile_num,
                "assignedOfficer": data.assigned_officer or "",
                "createdAt": data.created_at,
                "evidence": evidence_urls,
                "notes": notes_mapped
            }
        return data


    class Config:
        from_attributes = True

class ComplaintUpdateStatus(BaseModel):
    status: str

class ComplaintAssignOfficer(BaseModel):
    assignedOfficer: str
