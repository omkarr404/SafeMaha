# FILE NAME: d:\Omkar\Water\FDA\backend\app\models\notification.py

"""SQLAlchemy model for user notifications.

Fields:
- id: primary key (String format matching notif-timestamp-rand)
- complaint_id: foreign key referencing the relevant complaint
- mobile: citizen's phone number
- title_en: English title
- title_mr: Marathi title
- description_en: English description
- description_mr: Marathi description
- is_read: read flag
- created_at: timestamp
"""

from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database.connection import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(100), primary_key=True, index=True)
    complaint_id = Column(String(50), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=True)
    mobile = Column(String(20), nullable=False, index=True)
    
    title_en = Column(String(200), nullable=False)
    title_mr = Column(String(200), nullable=False)
    description_en = Column(String(1000), nullable=False)
    description_mr = Column(String(1000), nullable=False)
    
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    complaint = relationship("Complaint", backref="notifications_assoc")
