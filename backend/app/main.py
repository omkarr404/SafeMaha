# FILE NAME: d:\Omkar\Water\FDA\backend\app\main.py

import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database.connection import Base, engine, get_db
from .models import * # Import all models to ensure they register on Base
from .api import auth, complaints, admin, upload, notifications, officers, districts
from .config.settings import settings


# Automatically create database tables on startup (SQLite fallback or DB connection)
Base.metadata.create_all(bind=engine)

# Verify schema and run simple SQLite migrations
from .database.connection import verify_and_migrate_db, seed_districts_and_talukas, SessionLocal
verify_and_migrate_db()

# Seed Maharashtra districts and talukas
db = SessionLocal()
try:
    seed_districts_and_talukas(db)
finally:
    db.close()


app = FastAPI(
    title="FDA SafeMaha Backend",
    description="Production-grade API backend for citizen grievance management",
    version="1.0.0"
)

# CORS Configuration
# Allow Expo local developer connections and React admin dashboard connections
origins = [
    "http://localhost:5173", # React admin dev port
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost:19000", # Expo default Metro port
    "http://localhost:19006", # Expo web port
    "http://localhost:8081",  # Expo new standard bundler port
    "*"                       # Accept wildcard for easier local/WiFi device tests
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure local upload directories exist and mount static files
STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
UPLOAD_DIR = os.path.join(STATIC_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount the static directory under "/static"
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Include API routers
app.include_router(auth.router)
app.include_router(complaints.router)
app.include_router(admin.router)
app.include_router(upload.router)
app.include_router(notifications.router)
app.include_router(officers.router)
app.include_router(districts.router)


# Also support legacy endpoints without /api prefix if required,
# but we kept prefixes in routing matching standard FastAPI clean conventions.
# For mock-server drop-in mapping:
# mock-server used /api/complaints, /api/notifications, /api/clear.
# Our routes have prefix="/api/..." so they match exactly!

@app.on_event("startup")
async def startup_event():
    import asyncio
    from .services.escalation_service import run_escalation_checks_loop
    asyncio.create_task(run_escalation_checks_loop())

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "FDA SafeMaha Production API Server",
        "documentation": "/docs"
    }

@app.get("/api/clear")
def legacy_clear_get(db = Depends(get_db)):
    """Add a quick get clear route for easier direct browser cleans."""
    from .api.complaints import clear_all_records
    return clear_all_records(db)
