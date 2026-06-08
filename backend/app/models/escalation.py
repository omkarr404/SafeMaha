# FILE NAME: d:\Omkar\Water\FDA\backend\app\models\escalation.py

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database.connection import Base

class ComplaintEscalation(Base):
    __tablename__ = "complaint_escalations"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(String(50), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    escalated_from = Column(String(150), nullable=True)  # Name/Role of previous assignee
    escalated_to = Column(String(150), nullable=False)    # Role/Name of escalated target (Inspector/Senior Inspector/etc.)
    reason = Column(Text, nullable=False)
    escalated_at = Column(DateTime, default=datetime.utcnow)

    complaint = relationship("Complaint")
