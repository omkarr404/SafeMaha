# FILE NAME: d:\\Omkar\\Water\\FDA\\backend\\app\\models\\evidence.py

"""SQLAlchemy model for evidence files attached to complaints.

Fields:
- id: primary key
- complaint_id: foreign key to complaints
- file_url: URL of the stored evidence file
- uploaded_at: timestamp of upload
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database.connection import Base

class Evidence(Base):
    __tablename__ = "evidences"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(String(50), ForeignKey("complaints.id"), nullable=False, index=True)
    file_url = Column(String, nullable=False)

    uploaded_at = Column(DateTime, default=datetime.utcnow)

    complaint = relationship("Complaint", back_populates="evidences")
