# FILE NAME: d:\Omkar\Water\FDA\backend\app\services\push_notification_service.py

import urllib.request
import json
import logging
from sqlalchemy.orm import Session
from ..models.user import User

logger = logging.getLogger(__name__)

def send_push_notification(token: str, title: str, body: str, data: dict = None):
    """Sends a push notification to an Expo Push Token via Expo's Push API."""
    if not token or not token.startswith("ExponentPushToken"):
        logger.warning(f"Invalid Expo Push Token: {token}. Skipping push notification.")
        return False
        
    url = "https://exp.host/--/api/v2/push/send"
    payload = {
        "to": token,
        "sound": "default",
        "title": title,
        "body": body
    }
    if data:
        payload["data"] = data

    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=5.0) as response:
            res_body = response.read().decode("utf-8")
            logger.info(f"Push notification response: {res_body}")
            return True
    except Exception as e:
        logger.warning(f"Failed to send push notification to Expo: {str(e)}")
        return False

def notify_user_event(db: Session, user_id: int, title: str, body: str, data: dict = None):
    """Finds user by id and sends push notification if an expo token is registered."""
    user = db.query(User).filter(User.id == user_id).first()
    if user and user.expo_push_token:
        send_push_notification(user.expo_push_token, title, body, data)
