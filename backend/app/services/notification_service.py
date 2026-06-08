# FILE NAME: d:\Omkar\Water\FDA\backend\app\services\notification_service.py

import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from ..models.notification import Notification

def create_status_notification(db: Session, complaint_id: str, status: str, mobile: str) -> Notification:
    """Generates localized English and Marathi notifications based on complaint status changes,
    saves the notification to the database, and commits the transaction.
    """
    date = datetime.utcnow()
    
    title_en = ""
    desc_en = ""
    title_mr = ""
    desc_mr = ""

    if status == "Submitted":
        title_en = "Complaint Submitted Successfully"
        desc_en = f"Your complaint {complaint_id} has been successfully logged and is awaiting review."
        title_mr = "तक्रार यशस्वीरित्या नोंदवली"
        desc_mr = f"तुमची तक्रार {complaint_id} यशस्वीरित्या नोंदवली गेली आहे आणि पुनरावलोकनाची प्रतीक्षा आहे."
    elif status == "Assigned":
        title_en = "Officer Assigned"
        desc_en = f"An FDA Officer has been assigned to inspect and review your complaint {complaint_id}."
        title_mr = "अधिकारी नियुक्त"
        desc_mr = f"तुमच्या तक्रार {complaint_id} च्या तपासणी आणि पुनरावलोकनासाठी अन्न व औषध सुरक्षा अधिकारी नियुक्त केले आहेत."
    elif status == "Investigation":
        title_en = "Investigation Started"
        desc_en = f"Officer is investigating the incident details for complaint {complaint_id}."
        title_mr = "तпас सुरू"
        desc_mr = f"अधिकारी तक्रार {complaint_id} च्या घटनास्थळाची आणि तपशीलांची तपासणी करत आहेत."
    elif status == "Action Taken":
        title_en = "Action Taken"
        desc_en = f"Legal warnings, compliance notices or recall directives issued for complaint {complaint_id}."
        title_mr = "कारवाई केली"
        desc_mr = f"तक्रार {complaint_id} संदर्भात कायदेशीर नोटीस किंवा निर्देश जारी करण्यात आले आहेत."
    elif status == "Closed":
        title_en = "Complaint Closed"
        desc_en = f"Resolution audit is complete and complaint {complaint_id} is closed."
        title_mr = "तक्रार बंद करण्यात आली"
        desc_mr = f"निवारण लेखापरीक्षण पूर्ण झाले असून तक्रार {complaint_id} यशस्वीरित्या बंद करण्यात आली आहे."
    else:
        title_en = "Status Updated"
        desc_en = f"The status of your complaint {complaint_id} is now {status}."
        title_mr = "स्थिती अद्यतनित"
        desc_mr = f"तुमच्या तक्रार {complaint_id} ची स्थिती आता {status} आहे."

    # Generate a unique notification ID matching format notif-timestamp-rand
    notif_id = f"notif-{int(date.timestamp() * 1000)}-{uuid.uuid4().hex[:4]}"
    
    new_notif = Notification(
        id=notif_id,
        complaint_id=complaint_id,
        mobile=mobile or "",
        title_en=title_en,
        title_mr=title_mr,
        description_en=desc_en,
        description_mr=desc_mr,
        is_read=False,
        created_at=date
    )
    
    db.add(new_notif)
    db.commit()
    db.refresh(new_notif)

    # Dispatch real-time Expo push notification if token is available
    try:
        from ..models.user import User
        from .push_notification_service import send_push_notification
        user = db.query(User).filter(User.phone_number == mobile).first()
        if user and user.expo_push_token:
            push_title = f"{title_en} / {title_mr}"
            push_desc = f"{desc_en}\n{desc_mr}"
            send_push_notification(user.expo_push_token, push_title, push_desc, {"complaint_id": complaint_id})
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(f"Failed to dispatch Expo push: {e}")

    return new_notif

