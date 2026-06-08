# FILE NAME: d:\Omkar\Water\FDA\backend\app\models\assignment.py

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database.connection import Base

class ComplaintAssignment(Base):
    __tablename__ = "complaint_assignments"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(String(50), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    officer_id = Column(Integer, ForeignKey("officers.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_by = Column(String(100), nullable=False)  # Admin email who assigned the task
    assigned_at = Column(DateTime, default=datetime.utcnow)

    complaint = relationship("Complaint")
    officer = relationship("Officer")
