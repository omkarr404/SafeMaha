# FILE NAME: d:\Omkar\Water\FDA\backend\app\api\auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from ..database.connection import get_db
from ..models.user import User
from ..schemas.user import OTPRequest, OTPVerify, Token, PushTokenRegister, UserProfileUpdate, UserProfileResponse
from ..services.otp_service import send_otp, verify_otp
from ..services.auth_service import create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/request-otp", status_code=status.HTTP_200_OK)
def request_otp(payload: OTPRequest):
    """Generates and sends (via console logging) a 6-digit OTP code to the provided phone number."""
    phone_number = payload.phone_number.strip()
    if not phone_number:
        raise HTTPException(status_code=400, detail="Phone number is required.")
    
    # Trigger OTP send
    send_otp(phone_number)
    return {"message": f"OTP successfully generated and sent to {phone_number}."}

@router.post("/verify-otp", response_model=Token)
def verify_and_login(payload: OTPVerify, db: Session = Depends(get_db)):
    """Verifies OTP. If successful, logs in the user (registers them if they don't exist) and returns a JWT token."""
    phone_number = payload.phone_number.strip()
    code = payload.code.strip()
    
    if not phone_number or not code:
        raise HTTPException(status_code=400, detail="Phone number and verification code are required.")
    
    # Verify OTP
    is_valid = verify_otp(phone_number, code)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired verification code.")
    
    # Retrieve user or auto-register them
    user = db.query(User).filter(User.phone_number == phone_number).first()
    if not user:
        user = User(phone_number=phone_number, created_at=datetime.utcnow())
        db.add(user)
        db.commit()
        db.refresh(user)
        
    # Generate token
    token_data = {"sub": phone_number, "role": "citizen", "user_id": user.id}
    access_token = create_access_token(data=token_data)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "phone_number": phone_number
    }

@router.post("/register-push-token", status_code=status.HTTP_200_OK)
def register_push_token(
    payload: PushTokenRegister,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Registers the device's Expo push token for the authenticated citizen user."""
    current_user.expo_push_token = payload.token.strip()
    db.commit()
    return {"success": True, "message": "Expo push token registered successfully."}

@router.get("/profile", response_model=UserProfileResponse)
def get_user_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves profile statistics and basic user info for the authenticated citizen."""
    from ..models.complaint import Complaint
    
    total_count = db.query(Complaint).filter(Complaint.user_id == current_user.id).count()
    open_count = db.query(Complaint).filter(
        Complaint.user_id == current_user.id,
        Complaint.status != "Closed"
    ).count()
    closed_count = total_count - open_count
    
    return {
        "phone_number": current_user.phone_number,
        "name": current_user.name,
        "complaints_count": total_count,
        "open_complaints_count": open_count,
        "closed_complaints_count": closed_count
    }

@router.put("/profile", response_model=UserProfileResponse)
def update_user_profile(
    payload: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Updates the display name of the authenticated citizen user."""
    from ..models.complaint import Complaint
    
    current_user.name = payload.name.strip()
    db.commit()
    db.refresh(current_user)
    
    total_count = db.query(Complaint).filter(Complaint.user_id == current_user.id).count()
    open_count = db.query(Complaint).filter(
        Complaint.user_id == current_user.id,
        Complaint.status != "Closed"
    ).count()
    closed_count = total_count - open_count
    
    return {
        "phone_number": current_user.phone_number,
        "name": current_user.name,
        "complaints_count": total_count,
        "open_complaints_count": open_count,
        "closed_complaints_count": closed_count
    }

