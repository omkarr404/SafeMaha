# FILE NAME: d:\\Omkar\\Water\\FDA\\backend\\app\\models\\note.py

"""SQLAlchemy model for officer notes attached to complaints.

Fields:
- id: primary key
- complaint_id: foreign key to complaints
- officer_id: foreign key to users (the officer creating the note)
- content: text of the note
- created_at: timestamp
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database.connection import Base

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(String(50), ForeignKey("complaints.id"), nullable=False, index=True)
    officer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    complaint = relationship("Complaint", back_populates="notes")
    officer = relationship("User", backref="notes")
