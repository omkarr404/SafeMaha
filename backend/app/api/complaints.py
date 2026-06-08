# FILE NAME: d:\Omkar\Water\FDA\backend\app\api\complaints.py

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional

from ..database.connection import get_db
from ..models.complaint import Complaint
from ..models.evidence import Evidence
from ..models.note import Note
from ..models.user import User
from ..models.notification import Notification
from ..models.audit_log import AuditLog
from ..models.officer import Officer
from ..models.assignment import ComplaintAssignment
from ..schemas.complaint import ComplaintCreate, ComplaintResponse
from ..services.auth_service import get_current_user_optional, get_current_user
from ..services.notification_service import create_status_notification


router = APIRouter(prefix="/api/complaints", tags=["complaints"])

def get_or_create_officer_user(db: Session, officer_name: str) -> User:
    """Finds or creates a dummy/inspector user associated with the officer name
    to satisfy foreign key requirements in the notes table.
    """
    name = officer_name.strip() if officer_name else "FDA Inspector"
    # Search user by phone number / identifier
    user = db.query(User).filter(User.phone_number == name).first()
    if not user:
        user = User(phone_number=name, created_at=datetime.utcnow())
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

def generate_complaint_id(db: Session) -> str:
    """Generates a sequential complaint ID like MHFDA-YYYY-XXXXXX based on the current year."""
    year = datetime.utcnow().year
    prefix = f"MHFDA-{year}-"
    
    last_complaint = (
        db.query(Complaint)
        .filter(Complaint.id.like(f"{prefix}%"))
        .order_by(Complaint.id.desc())
        .first()
    )
    
    next_seq = 1
    if last_complaint:
        try:
            parts = last_complaint.id.split("-")
            if len(parts) == 3:
                last_seq = int(parts[2])
                next_seq = last_seq + 1
        except ValueError:
            pass
            
    return f"{prefix}{next_seq:06d}"

@router.get("/", response_model=List[ComplaintResponse])
def get_complaints(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Retrieves complaints.
    - If authenticated as citizen, returns only their complaints.
    - If unauthenticated or admin, returns ALL complaints to support dashboard view.
    """
    if current_user:
        return (
            db.query(Complaint)
            .filter(Complaint.user_id == current_user.id)
            .order_by(Complaint.created_at.desc())
            .all()
        )
    return db.query(Complaint).order_by(Complaint.created_at.desc()).all()

@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(
    complaint_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Retrieves specific complaint details. Assures citizen has ownership check if authenticated."""
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")
        
    if current_user and complaint.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied.")
        
    return complaint

@router.post("/", response_model=ComplaintResponse)
def create_or_sync_complaint(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Creates a new complaint OR updates/syncs if it already exists by ID.
    Supports citizen creation as well as admin initialization mock data.
    """
    comp_id = payload.get("id")
    
    # Check if this is a sync/update for an existing complaint
    if comp_id:
        existing = db.query(Complaint).filter(Complaint.id == comp_id).first()
        if existing:
            # Re-route to PUT logic
            return update_complaint_record(comp_id, payload, db)

    # Otherwise, perform standard creation
    if not comp_id:
        comp_id = generate_complaint_id(db)

    # Determine user ownership
    owner_id = None
    if current_user:
        owner_id = current_user.id
    else:
        # Create or fetch a dummy citizen user for this complaint's phone number
        mobile = payload.get("mobile") or "9876543210"
        user = db.query(User).filter(User.phone_number == mobile).first()
        if not user:
            user = User(phone_number=mobile, created_at=datetime.utcnow())
            db.add(user)
            db.commit()
            db.refresh(user)
        owner_id = user.id

    # Unpack location
    lat, lng, addr = None, None, None
    loc = payload.get("location")
    if loc:
        lat = loc.get("latitude")
        lng = loc.get("longitude")
        addr = loc.get("address")

    status_val = payload.get("status") or "Submitted"
    
    priority_val = payload.get("priority")
    if not priority_val or priority_val == "Low":
        desc_lower = (payload.get("description") or "").lower()
        title_lower = (payload.get("title") or "").lower()
        combined = f"{title_lower} {desc_lower}"
        if "poison" in combined or "outbreak" in combined or "hospital" in combined:
            priority_val = "Critical"
        elif "expire" in combined or "contaminat" in combined or "fake" in combined or "adulterat" in combined:
            priority_val = "High"
        elif payload.get("category") in ["drug", "food"]:
            priority_val = "Medium"
        else:
            priority_val = "Low"
            
    district_id_val = payload.get("district_id")
    taluka_id_val = payload.get("taluka_id")

    new_comp = Complaint(
        id=comp_id,
        user_id=owner_id,
        title=payload.get("title", "Untitled Complaint").strip(),
        category=payload.get("category", "other"),
        description=payload.get("description", "").strip(),
        status=status_val,
        citizen_name=payload.get("name") or payload.get("citizen_name"),
        assigned_officer=payload.get("assignedOfficer"),
        latitude=lat,
        longitude=lng,
        address=addr,
        priority=priority_val,
        district_id=district_id_val,
        taluka_id=taluka_id_val,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(new_comp)
    
    # Insert initial evidence if any
    evidence_list = payload.get("evidence") or []
    for ev_url in evidence_list:
        if ev_url:
            db.add(Evidence(complaint_id=comp_id, file_url=ev_url, uploaded_at=datetime.utcnow()))
            
    # Insert notes if any
    notes_list = payload.get("notes") or []
    for n in notes_list:
        officer = get_or_create_officer_user(db, n.get("author") or "FDA Inspector")
        db.add(Note(
            complaint_id=comp_id,
            officer_id=officer.id,
            content=n.get("comment") or n.get("content") or "",
            created_at=datetime.utcnow()
        ))
        
    db.commit()
    db.refresh(new_comp)
    
    # Trigger notification
    mobile_num = db.query(User).filter(User.id == owner_id).first().phone_number
    create_status_notification(db, comp_id, status_val, mobile_num)
    
    # Log Audit
    try:
        audit = AuditLog(
            user_id=mobile_num,
            action="Complaint Created",
            entity_type="complaint",
            entity_id=comp_id,
            timestamp=datetime.utcnow()
        )
        db.add(audit)
        db.commit()
    except Exception as e:
        print(f"Error logging creation audit: {e}")

    
    return new_comp

def update_complaint_record(comp_id: str, payload: dict, db: Session) -> Complaint:
    """Helper that updates an existing complaint record from payload and commits."""
    comp = db.query(Complaint).filter(Complaint.id == comp_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found.")
        
    old_status = comp.status
    new_status = payload.get("status")
    
    if new_status and new_status != old_status:
        comp.status = new_status
        audit = AuditLog(
            user_id=payload.get("actor_email") or "admin@fda.gov.in",
            action="Status Update",
            entity_type="complaint",
            entity_id=comp_id,
            timestamp=datetime.utcnow()
        )
        db.add(audit)
        
    if "assignedOfficer" in payload:
        old_officer = comp.assigned_officer
        new_officer = payload.get("assignedOfficer")
        if new_officer != old_officer:
            comp.assigned_officer = new_officer
            
            # Record Assignment history
            off = db.query(Officer).filter(Officer.name == new_officer).first()
            if off:
                assignment = ComplaintAssignment(
                    complaint_id=comp_id,
                    officer_id=off.id,
                    assigned_by=payload.get("actor_email") or "admin@fda.gov.in",
                    assigned_at=datetime.utcnow()
                )
                db.add(assignment)
                
            audit = AuditLog(
                user_id=payload.get("actor_email") or "admin@fda.gov.in",
                action="Officer Assigned",
                entity_type="complaint",
                entity_id=comp_id,
                timestamp=datetime.utcnow()
            )
            db.add(audit)
            
    if "priority" in payload:
        old_priority = comp.priority
        new_priority = payload.get("priority")
        if new_priority and new_priority != old_priority:
            comp.priority = new_priority
            audit = AuditLog(
                user_id=payload.get("actor_email") or "admin@fda.gov.in",
                action="Priority Update",
                entity_type="complaint",
                entity_id=comp_id,
                timestamp=datetime.utcnow()
            )
            db.add(audit)
        
    if "name" in payload:
        comp.citizen_name = payload.get("name")
        
    comp.updated_at = datetime.utcnow()
    
    # Sync evidence
    if "evidence" in payload:
        # Clear existing evidence and re-add
        db.query(Evidence).filter(Evidence.complaint_id == comp_id).delete()
        evidence_list = payload.get("evidence") or []
        for url in evidence_list:
            if url:
                db.add(Evidence(complaint_id=comp_id, file_url=url, uploaded_at=datetime.utcnow()))
                
    # Sync notes
    if "notes" in payload:
        notes_list = payload.get("notes") or []
        # Find which notes are new by content/timestamp
        existing_notes = db.query(Note).filter(Note.complaint_id == comp_id).all()
        existing_contents = {en.content for en in existing_notes}
        
        for n in notes_list:
            content = n.get("comment") or n.get("content") or ""
            if content and content not in existing_contents:
                officer = get_or_create_officer_user(db, n.get("author") or "FDA Inspector")
                db.add(Note(
                    complaint_id=comp_id,
                    officer_id=officer.id,
                    content=content,
                    created_at=datetime.utcnow()
                ))
                
    db.commit()
    db.refresh(comp)
    
    # If status changed, generate status change notification for citizen
    if new_status and new_status != old_status:
        create_status_notification(db, comp_id, new_status, comp.user.phone_number)
        
    return comp

@router.put("/{complaint_id}", response_model=ComplaintResponse)
def update_complaint_endpoint(
    complaint_id: str,
    payload: dict,
    db: Session = Depends(get_db)
):
    """Admin endpoint for updating a complaint status, officer, and internal notes."""
    return update_complaint_record(complaint_id, payload, db)

@router.delete("/clear")
def clear_all_records(db: Session = Depends(get_db)):
    """Development database cleaner. Resets all grievance database tables."""
    try:
        from ..models.assignment import ComplaintAssignment
        from ..models.escalation import ComplaintEscalation
        from ..models.audit_log import AuditLog
        
        db.query(Evidence).delete()
        db.query(Note).delete()
        db.query(Notification).delete()
        db.query(ComplaintAssignment).delete()
        db.query(ComplaintEscalation).delete()
        db.query(AuditLog).delete()
        db.query(Complaint).delete()
        db.commit()
        return {"success": True, "message": "Successfully cleared all grievance database records."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database clean failed: {str(e)}")

