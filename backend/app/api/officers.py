# FILE NAME: d:\Omkar\Water\FDA\backend\app\api\officers.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..database.connection import get_db
from ..models.officer import Officer
from ..models.audit_log import AuditLog
from ..schemas.officer import OfficerCreate, OfficerUpdate, OfficerResponse
from ..services.auth_service import get_current_admin

router = APIRouter(prefix="/api/admin/officers", tags=["officers"])

@router.get("/", response_model=List[OfficerResponse])
def list_officers(
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Retrieve all officers registered in the system."""
    return db.query(Officer).all()

@router.post("/", response_model=OfficerResponse, status_code=status.HTTP_201_CREATED)
def create_officer(
    payload: OfficerCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Create a new officer record."""
    # Check if email is already taken
    existing = db.query(Officer).filter(Officer.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Officer with this email already exists.")
        
    officer = Officer(
        name=payload.name,
        email=payload.email,
        mobile=payload.mobile,
        district=payload.district,
        role=payload.role,
        is_active=payload.is_active if payload.is_active is not None else True,
        created_at=datetime.utcnow()
    )
    db.add(officer)
    db.commit()
    db.refresh(officer)
    
    # Log Audit
    audit = AuditLog(
        user_id=admin.get("sub"),
        action="Created Officer",
        entity_type="officer",
        entity_id=str(officer.id),
        timestamp=datetime.utcnow()
    )
    db.add(audit)
    db.commit()
    
    return officer

@router.patch("/{officer_id}", response_model=OfficerResponse)
def update_officer(
    officer_id: int,
    payload: OfficerUpdate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Update details or active status of a specific officer."""
    officer = db.query(Officer).filter(Officer.id == officer_id).first()
    if not officer:
        raise HTTPException(status_code=404, detail="Officer not found.")
        
    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(officer, key, value)
        
    db.commit()
    db.refresh(officer)
    
    # Log Audit
    audit = AuditLog(
        user_id=admin.get("sub"),
        action="Updated Officer",
        entity_type="officer",
        entity_id=str(officer.id),
        timestamp=datetime.utcnow()
    )
    db.add(audit)
    db.commit()
    
    return officer

@router.delete("/{officer_id}", status_code=status.HTTP_200_OK)
def delete_officer(
    officer_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Delete an officer record from the system."""
    officer = db.query(Officer).filter(Officer.id == officer_id).first()
    if not officer:
        raise HTTPException(status_code=404, detail="Officer not found.")
        
    db.delete(officer)
    
    # Log Audit
    audit = AuditLog(
        user_id=admin.get("sub"),
        action="Deleted Officer",
        entity_type="officer",
        entity_id=str(officer_id),
        timestamp=datetime.utcnow()
    )
    db.add(audit)
    db.commit()
    
    return {"success": True, "message": "Officer deleted successfully."}
