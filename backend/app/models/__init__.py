# FILE NAME: d:\Omkar\Water\FDA\backend\app\models\__init__.py

from ..database.connection import Base
from .user import User
from .complaint import Complaint
from .evidence import Evidence
from .notification import Notification
from .note import Note
from .officer import Officer
from .district import District, Taluka
from .assignment import ComplaintAssignment
from .escalation import ComplaintEscalation
from .audit_log import AuditLog

# For migration/create_all discovery
__all__ = [
    "Base", 
    "User", 
    "Complaint", 
    "Evidence", 
    "Notification", 
    "Note", 
    "Officer", 
    "District", 
    "Taluka", 
    "ComplaintAssignment", 
    "ComplaintEscalation", 
    "AuditLog"
]
