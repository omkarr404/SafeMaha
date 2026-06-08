from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..services.auth_service import create_access_token, get_current_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])

class AdminLoginRequest(BaseModel):
    email: str
    password: str

class AdminUserResponse(BaseModel):
    email: str
    name: str
    role: str

class AdminLoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: AdminUserResponse

@router.post("/login", response_model=AdminLoginResponse)
def admin_login(payload: AdminLoginRequest):
    """Authenticates admin credentials and returns a secure JWT token."""
    email = payload.email.strip().lower()
    password = payload.password.strip()

    # Match the predefined official credentials in prototype
    if email == "admin@fda.gov.in" and password == "admin123":
        # Generate admin JWT
        token_data = {"sub": email, "role": "admin"}
        token = create_access_token(data=token_data)
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "email": email,
                "name": "Shri. S. K. Patil",
                "role": "Senior FDA Commissioner"
            }
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid official email or password."
        )

@router.get("/analytics")
def get_admin_analytics(
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Fetch KPI metrics and analytical grouping structures for the dashboard charts."""
    from ..models.complaint import Complaint
    from ..models.escalation import ComplaintEscalation
    from ..models.district import District
    from sqlalchemy import func
    
    total_count = db.query(Complaint).count()
    open_count = db.query(Complaint).filter(Complaint.status != "Closed").count()
    closed_count = db.query(Complaint).filter(Complaint.status == "Closed").count()
    high_priority_count = db.query(Complaint).filter(Complaint.priority.in_(["High", "Critical"])).count()
    
    # Escalated count
    escalated_count = db.query(ComplaintEscalation.complaint_id).distinct().count()
    
    # Complaints by District
    district_counts = (
        db.query(District.name, func.count(Complaint.id))
        .join(Complaint, District.id == Complaint.district_id)
        .group_by(District.name)
        .all()
    )
    by_district = {name: count for name, count in district_counts}
    
    # Complaints by Category
    category_counts = (
        db.query(Complaint.category, func.count(Complaint.id))
        .group_by(Complaint.category)
        .all()
    )
    by_category = {cat: count for cat, count in category_counts}
    
    # Monthly trends (Group by Year-Month) using memory-safe Python extraction
    complaints_dates = db.query(Complaint.created_at).all()
    monthly_trends = {}
    for (created_at,) in complaints_dates:
        if created_at:
            month_key = created_at.strftime("%Y-%m")
            monthly_trends[month_key] = monthly_trends.get(month_key, 0) + 1
            
    # Resolution Rate
    resolution_rate = 0.0
    if total_count > 0:
        resolution_rate = round((closed_count / total_count) * 100, 2)
        
    return {
        "summary": {
            "total": total_count,
            "open": open_count,
            "closed": closed_count,
            "high_priority": high_priority_count,
            "escalated": escalated_count,
            "resolution_rate": resolution_rate
        },
        "by_district": by_district,
        "by_category": by_category,
        "monthly_trends": monthly_trends
    }

@router.get("/complaints/{complaint_id}/escalations")
def get_complaint_escalations(
    complaint_id: str,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Retrieve the escalation history for a specific complaint."""
    from ..models.escalation import ComplaintEscalation
    return db.query(ComplaintEscalation).filter(ComplaintEscalation.complaint_id == complaint_id).order_by(ComplaintEscalation.escalated_at.desc()).all()

@router.get("/complaints/{complaint_id}/audits")
def get_complaint_audits(
    complaint_id: str,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Retrieve audit log actions tracked for a specific complaint."""
    from ..models.audit_log import AuditLog
    return db.query(AuditLog).filter(
        AuditLog.entity_type == "complaint",
        AuditLog.entity_id == complaint_id
    ).order_by(AuditLog.timestamp.desc()).all()

