# FILE NAME: d:\Omkar\Water\FDA\backend\app\api\notifications.py

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..database.connection import get_db
from ..models.notification import Notification
from ..schemas.notification import NotificationCreate, NotificationResponse

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

@router.get("/", response_model=List[NotificationResponse])
def get_notifications(
    mobile: Optional[str] = Query(None, description="Filter notifications by citizen's mobile number"),
    db: Session = Depends(get_db)
):
    """Retrieves notifications. If a mobile number is provided, filters by that number."""
    query = db.query(Notification)
    if mobile:
        query = query.filter(Notification.mobile == mobile)
    return query.order_by(Notification.created_at.desc()).all()

@router.post("/", response_model=NotificationResponse)
def create_notification(
    payload: NotificationCreate,
    db: Session = Depends(get_db)
):
    """Creates a custom notification (e.g. triggered from device or backend services)."""
    # Create notification ID if not provided
    notif_id = payload.id
    if not notif_id:
        notif_id = f"notif-{int(datetime.utcnow().timestamp() * 1000)}"

    new_notif = Notification(
        id=notif_id,
        complaint_id=payload.complaintId,
        mobile=payload.mobile,
        title_en=payload.title.en,
        title_mr=payload.title.mr,
        description_en=payload.description.en,
        description_mr=payload.description.mr,
        is_read=payload.read or False,
        created_at=payload.date or datetime.utcnow()
    )
    
    db.add(new_notif)
    db.commit()
    db.refresh(new_notif)
    return new_notif

@router.put("/{notif_id}/read", response_model=NotificationResponse)
def mark_notification_as_read(
    notif_id: str,
    db: Session = Depends(get_db)
):
    """Marks a single notification as read."""
    notif = db.query(Notification).filter(Notification.id == notif_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found.")
        
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif

@router.put("/read-all")
def mark_all_read(
    mobile: Optional[str] = Query(None, description="Mark all as read for this mobile"),
    db: Session = Depends(get_db)
):
    """Marks all notifications as read. If mobile is specified, only updates those notifications."""
    query = db.query(Notification)
    if mobile:
        query = query.filter(Notification.mobile == mobile)
        
    unread_notifs = query.filter(Notification.is_read == False).all()
    updated_count = len(unread_notifs)
    
    for notif in unread_notifs:
        notif.is_read = True
        
    db.commit()
    return {"success": True, "updatedCount": updated_count}
