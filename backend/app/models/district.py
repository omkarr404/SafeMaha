# FILE NAME: d:\Omkar\Water\FDA\backend\app\models\district.py

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from ..database.connection import Base

class District(Base):
    __tablename__ = "districts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)

    talukas = relationship("Taluka", back_populates="district", cascade="all, delete-orphan")

class Taluka(Base):
    __tablename__ = "talukas"

    id = Column(Integer, primary_key=True, index=True)
    district_id = Column(Integer, ForeignKey("districts.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False, index=True)

    district = relationship("District", back_populates="talukas")
