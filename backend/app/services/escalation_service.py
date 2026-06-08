# FILE NAME: d:\Omkar\Water\FDA\backend\app\services\escalation_service.py

import asyncio
import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..database.connection import SessionLocal
from ..models.complaint import Complaint
from ..models.escalation import ComplaintEscalation
from ..models.audit_log import AuditLog
from .push_notification_service import send_push_notification

logger = logging.getLogger(__name__)

def check_and_escalate_complaints(db: Session):
    """Checks open complaints and escalates them based on age and priority levels."""
    now = datetime.utcnow()
    
    # Retrieve all complaints that are not resolved or closed
    open_complaints = db.query(Complaint).filter(Complaint.status != "Closed").all()
    
    for comp in open_complaints:
        limit = None
        if comp.priority == "Critical":
            limit = timedelta(hours=24)
        elif comp.priority == "High":
            limit = timedelta(days=3)
        else:
            continue
            
        age = now - comp.created_at
        if age > limit:
            # Check if already escalated
            existing = db.query(ComplaintEscalation).filter(ComplaintEscalation.complaint_id == comp.id).first()
            if existing:
                continue
                
            escalated_from = comp.assigned_officer or "Unassigned"
            escalated_to = "Senior Inspector"
            
            if comp.assigned_officer:
                if "Senior Inspector" in comp.assigned_officer:
                    escalated_to = "District Officer"
                elif "District Officer" in comp.assigned_officer:
                    escalated_to = "State Admin"
                elif "Inspector" in comp.assigned_officer:
                    escalated_to = "Senior Inspector"
            else:
                if comp.district:
                    escalated_to = f"District Officer - {comp.district.name}"
                else:
                    escalated_to = "District Officer"
                    
            reason = f"Automated Escalation: {comp.priority} priority complaint not resolved within {limit.total_seconds() / 3600:.0f} hours."
            
            # Log escalation
            escalation = ComplaintEscalation(
                complaint_id=comp.id,
                escalated_from=escalated_from,
                escalated_to=escalated_to,
                reason=reason,
                escalated_at=now
            )
            db.add(escalation)
            
            # Log audit
            audit = AuditLog(
                user_id="system-escalation",
                action="Complaint Escalated",
                entity_type="complaint",
                entity_id=comp.id,
                timestamp=now
            )
            db.add(audit)
            
            # Create a system note
            from ..models.note import Note
            from ..models.user import User
            system_user = db.query(User).filter(User.phone_number == "System").first()
            if not system_user:
                system_user = User(phone_number="System", created_at=now)
                db.add(system_user)
                db.flush()
                
            note = Note(
                complaint_id=comp.id,
                officer_id=system_user.id,
                content=f"[SYSTEM] Escalated from {escalated_from} to {escalated_to}. Reason: {reason}",
                created_at=now
            )
            db.add(note)
            db.commit()
            
            # Push Alert
            try:
                if comp.user and comp.user.expo_push_token:
                    send_push_notification(
                        comp.user.expo_push_token,
                        f"Complaint Escalated / तक्रार वर्ग करण्यात आली",
                        f"Your grievance {comp.id} has been escalated to {escalated_to} for fast-track investigation.",
                        {"complaint_id": comp.id}
                    )
            except Exception as e:
                logger.warning(f"Failed to send escalation push for {comp.id}: {e}")
                
            logger.info(f"Complaint {comp.id} successfully escalated to {escalated_to}")

async def run_escalation_checks_loop():
    """Asynchronous loop checking for escalations every 60 seconds."""
    logger.info("Starting background escalation checking service...")
    while True:
        try:
            db = SessionLocal()
            try:
                check_and_escalate_complaints(db)
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Error in escalation background loop: {e}")
        
        await asyncio.sleep(60)
