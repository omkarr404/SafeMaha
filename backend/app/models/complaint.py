# FILE NAME: d:\\Omkar\\Water\\FDA\\backend\\app\\models\\complaint.py

"""SQLAlchemy model for complaints submitted by citizens.

Fields:
- id: primary key
- user_id: foreign key to users
- category: complaint category string
- description: detailed text
- status: current status (e.g., pending, reviewed, resolved)
- created_at: timestamp
- updated_at: timestamp of last update
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database.connection import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(50), default="Submitted", nullable=False)
    
    # Citizen details submitted on form
    citizen_name = Column(String(100), nullable=True)
    
    # Admin / Officer assignments
    assigned_officer = Column(String(150), nullable=True)
    
    # Location details
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    address = Column(String(500), nullable=True)

    priority = Column(String(50), default="Low", nullable=False)
    district_id = Column(Integer, ForeignKey("districts.id"), nullable=True)
    taluka_id = Column(Integer, ForeignKey("talukas.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


    user = relationship("User", back_populates="complaints")
    district = relationship("District")
    taluka = relationship("Taluka")
    evidences = relationship("Evidence", back_populates="complaint", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="complaint", cascade="all, delete-orphan")
