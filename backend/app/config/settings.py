# FILE NAME: d:\Omkar\Water\FDA\backend\app\config\settings.py

import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load env variables from root of backend directory
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env'))

class Settings(BaseSettings):
    PORT: int = 8000
    DATABASE_URL: str = "sqlite:///./safemaha.db"
    
    JWT_SECRET: str = "44efbc348b6d8a29a1b181db89cd73105ab86e2417c2f6d2da53e8fb8a07c92b"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    SUPABASE_URL: str = "https://placeholder.supabase.co"
    SUPABASE_KEY: str = "placeholder"
    SUPABASE_BUCKET: str = "safemaha-evidence"

    class Config:
        case_sensitive = True

settings = Settings()
