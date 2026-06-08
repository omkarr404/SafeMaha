# FILE NAME: d:\Omkar\Water\FDA\backend\app\services\auth_service.py

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from ..config.settings import settings
from ..database.connection import get_db
from ..models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/verify-otp", auto_error=False)

SECRET_KEY = settings.JWT_SECRET
ALGORITHM = settings.JWT_ALGORITHM

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generates a JWT access token for the given payload data."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Dependency that extracts the JWT token, decodes it, and returns the User object.
    Supports token from authorization header.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired citizen authentication token.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        phone_number: str = payload.get("sub")
        role: str = payload.get("role")
        if phone_number is None or role != "citizen":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.phone_number == phone_number).first()
    if user is None:
        raise credentials_exception
    return user

async def get_current_admin(token: Optional[str] = Depends(oauth2_scheme)) -> dict:
    """Dependency that extracts the JWT token, decodes it, and verifies the user is an admin."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired administrator session.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        if email is None or role != "admin":
            raise credentials_exception
        return {"email": email, "role": role}
    except JWTError:
        raise credentials_exception

async def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[User]:
    """Optional user extractor. Returns User if valid token is provided, else returns None."""
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        phone_number: str = payload.get("sub")
        role: str = payload.get("role")
        if phone_number and role == "citizen":
            return db.query(User).filter(User.phone_number == phone_number).first()
    except JWTError:
        pass
    return None

