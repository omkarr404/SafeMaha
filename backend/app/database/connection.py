# FILE NAME: d:\\Omkar\\Water\\FDA\\backend\\app\\database\\connection.py

"""Database connection and session management.

Provides:
- SQLAlchemy engine using DATABASE_URL from settings with SQLite fallback.
- SessionLocal for creating DB sessions.
- Base declarative class for model definitions.
- FastAPI dependency ``get_db`` yielding a session.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Import settings; path relative to this file's location
from ..config.settings import settings

# Determine if using SQLite (default) or another DB URL.
# For SQLite, we need a special connect_args to allow multithreaded access.
if settings.DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False,
    )
else:
    engine = create_engine(settings.DATABASE_URL, echo=False)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for declarative models
Base = declarative_base()

# FastAPI dependency
def get_db():
    """Yield a database session for FastAPI route dependencies."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_and_migrate_db():
    """Checks the database schema and performs simple migrations (ALTER TABLE ADD COLUMN) for SQLite fallback."""
    from sqlalchemy import inspect, text
    inspector = inspect(engine)
    
    # Verify users columns
    if "users" in inspector.get_table_names():
        columns = [col["name"] for col in inspector.get_columns("users")]
        with engine.begin() as conn:
            if "name" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN name VARCHAR(100)"))
            if "expo_push_token" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN expo_push_token VARCHAR(200)"))

    # Verify complaints columns
    if "complaints" in inspector.get_table_names():
        columns = [col["name"] for col in inspector.get_columns("complaints")]
        with engine.begin() as conn:
            if "priority" not in columns:
                conn.execute(text("ALTER TABLE complaints ADD COLUMN priority VARCHAR(50) DEFAULT 'Low'"))
            if "district_id" not in columns:
                conn.execute(text("ALTER TABLE complaints ADD COLUMN district_id INTEGER"))
            if "taluka_id" not in columns:
                conn.execute(text("ALTER TABLE complaints ADD COLUMN taluka_id INTEGER"))

def seed_districts_and_talukas(db):
    """Seeds the database with Maharashtra districts and talukas if not already present."""
    from ..models.district import District, Taluka
    
    # Check if districts are already seeded
    if db.query(District).first() is not None:
        return
        
    data = {
        "Mumbai City": ["Mumbai City"],
        "Mumbai Suburban": ["Andheri", "Borivali", "Kurla"],
        "Thane": ["Thane", "Kalyan", "Ulhasnagar", "Bhiwandi", "Shahapur"],
        "Palghar": ["Palghar", "Dahanu", "Vasai", "Wada"],
        "Raigad": ["Alibag", "Panvel", "Karjat", "Mahad", "Roha"],
        "Ratnagiri": ["Ratnagiri", "Chiplun", "Dapoli", "Guhagar"],
        "Sindhudurg": ["Sawantwadi", "Kudal", "Kankavli", "Malvan"],
        "Nashik": ["Nashik", "Malegaon", "Niphad", "Sinnar"],
        "Dhule": ["Dhule", "Sakri", "Shirpur", "Sindkhede"],
        "Nandurbar": ["Nandurbar", "Navapur", "Shahada", "Taloda"],
        "Jalgaon": ["Jalgaon", "Bhusawal", "Chalisgaon", "Amalner"],
        "Ahmednagar": ["Ahmednagar", "Sangamner", "Rahuri", "Kopargaon"],
        "Pune": ["Pune City", "Haveli", "Baramati", "Khed", "Maval"],
        "Satara": ["Satara", "Karad", "Wai", "Phaltan"],
        "Sangli": ["Sangli", "Miraj", "Tasgaon", "Walwa"],
        "Solapur": ["Solapur", "Pandharpur", "Barshi", "Madha"],
        "Kolhapur": ["Kolhapur", "Karveer", "Ichalkaranji", "Panhala"],
        "Aurangabad": ["Aurangabad", "Vaijapur", "Kannad", "Sillod"],
        "Jalna": ["Jalna", "Bhokardan", "Partur", "Ambad"],
        "Parbhani": ["Parbhani", "Gangakhed", "Jintur", "Pathri"],
        "Hingoli": ["Hingoli", "Kalamnuri", "Basmath", "Sengaon"],
        "Beed": ["Beed", "Ambajogai", "Georai", "Parli"],
        "Nanded": ["Nanded", "Mukhed", "Degloor", "Bhokar"],
        "Osmanabad": ["Osmanabad", "Tuljapur", "Umarga", "Kalamb"],
        "Latur": ["Latur", "Udgir", "Ahmedpur", "Nilanga"],
        "Buldhana": ["Buldhana", "Malkapur", "Shegaon", "Khamgaon"],
        "Akola": ["Akola", "Akot", "Balapur", "Patur"],
        "Washim": ["Washim", "Risod", "Karanja", "Mangrulpir"],
        "Amravati": ["Amravati", "Achalpur", "Morshi", "Warud"],
        "Yavatmal": ["Yavatmal", "Pusad", "Digras", "Darwha"],
        "Wardha": ["Wardha", "Hinganghat", "Arvi", "Deoli"],
        "Nagpur": ["Nagpur", "Kamthi", "Umred", "Ramtek"],
        "Bhandara": ["Bhandara", "Tumsar", "Pauni", "Lakhni"],
        "Gondia": ["Gondia", "Tirora", "Goregaon", "Amgaon"],
        "Chandrapur": ["Chandrapur", "Warora", "Ballarpur", "Mul"],
        "Gadchiroli": ["Gadchiroli", "Aheri", "Chamorshi", "Armori"]
    }
    
    try:
        for d_name, talukas in data.items():
            district = District(name=d_name)
            db.add(district)
            db.flush() # Flush to get district.id
            for t_name in talukas:
                taluka = Taluka(district_id=district.id, name=t_name)
                db.add(taluka)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error seeding districts: {e}")


