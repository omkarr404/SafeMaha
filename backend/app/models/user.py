# FILE NAME: d:\\Omkar\\Water\\FDA\\backend\\app\\models\\user.py

"""SQLAlchemy model for application users.

Fields:
- id: primary key
- phone_number: unique phone identifier for OTP login
- created_at: timestamp of record creation
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from ..database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=True)
    expo_push_token = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    complaints = relationship("Complaint", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship(
        "Notification",
        primaryjoin="User.phone_number == Notification.mobile",
        foreign_keys="[Notification.mobile]",
        cascade="all, delete-orphan"
    )

