# FILE NAME: d:\Omkar\Water\FDA\backend\app\schemas\user.py

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    phone_number: str = Field(..., description="User's mobile number, used for OTP login")

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class OTPRequest(BaseModel):
    phone_number: str = Field(..., description="Mobile number to send OTP to")

class OTPVerify(BaseModel):
    phone_number: str = Field(..., description="Mobile number the OTP was sent to")
    code: str = Field(..., description="6-digit verification code")

class Token(BaseModel):
    access_token: str
    token_type: str
    phone_number: str

class TokenData(BaseModel):
    phone_number: Optional[str] = None

class PushTokenRegister(BaseModel):
    token: str

class UserProfileUpdate(BaseModel):
    name: str

class UserProfileResponse(BaseModel):
    phone_number: str
    name: Optional[str] = None
    complaints_count: int
    open_complaints_count: int
    closed_complaints_count: int

