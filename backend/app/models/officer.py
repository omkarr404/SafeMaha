# FILE NAME: d:\Omkar\Water\FDA\backend\app\models\officer.py

from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from ..database.connection import Base

class Officer(Base):
    __tablename__ = "officers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    mobile = Column(String(20), nullable=False)
    district = Column(String(100), nullable=False)
    role = Column(String(50), nullable=False)  # Inspector, Senior Inspector, District Officer, State Admin
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
