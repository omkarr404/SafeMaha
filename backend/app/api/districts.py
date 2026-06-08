# FILE NAME: d:\Omkar\Water\FDA\backend\app\api\districts.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database.connection import get_db
from ..models.district import District, Taluka
from ..schemas.district import DistrictResponse, TalukaResponse

router = APIRouter(prefix="/api/districts", tags=["districts"])

@router.get("/", response_model=List[DistrictResponse])
def get_districts(db: Session = Depends(get_db)):
    """Retrieve all Maharashtra districts."""
    return db.query(District).order_by(District.name).all()

@router.get("/{district_id}/talukas", response_model=List[TalukaResponse])
def get_talukas(district_id: int, db: Session = Depends(get_db)):
    """Retrieve all talukas for a specific district."""
    # Check if district exists
    district = db.query(District).filter(District.id == district_id).first()
    if not district:
        raise HTTPException(status_code=404, detail="District not found.")
        
    return db.query(Taluka).filter(Taluka.district_id == district_id).order_by(Taluka.name).all()
