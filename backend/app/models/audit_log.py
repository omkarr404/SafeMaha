# FILE NAME: d:\Omkar\Water\FDA\backend\app\models\audit_log.py

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from ..database.connection import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=True)  # email/phone of user who did it
    action = Column(String(100), nullable=False)  # e.g., Status Update, Reassignment, etc.
    entity_type = Column(String(50), nullable=False)  # e.g., complaint, officer, user
    entity_id = Column(String(100), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
