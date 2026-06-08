# FILE NAME: d:\Omkar\Water\FDA\backend\app\services\supabase_storage.py

import os
import uuid
import logging
from fastapi import UploadFile
from ..config.settings import settings

logger = logging.getLogger("supabase_storage")
logger.setLevel(logging.INFO)

# Try initializing Supabase client
supabase_client = None
if settings.SUPABASE_URL and settings.SUPABASE_KEY and "placeholder" not in settings.SUPABASE_URL:
    try:
        from supabase import create_client
        supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        logger.info("Supabase client initialized successfully.")
    except Exception as e:
        logger.warning(f"Failed to initialize Supabase client: {e}. Falling back to local storage.")
else:
    logger.info("Supabase credentials not configured. Using local storage directly.")

# Ensure local uploads directory exists
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "static", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def upload_file(file: UploadFile) -> str:
    """Uploads file to Supabase storage if available, otherwise falls back to local disk storage.
    
    Returns:
        str: Public URL of the uploaded file.
    """
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_content = await file.read()

    # Try uploading to Supabase if client is active
    if supabase_client is not None:
        try:
            bucket = settings.SUPABASE_BUCKET
            # Upload file
            res = supabase_client.storage.from_(bucket).upload(
                path=unique_filename,
                file=file_content,
                file_options={"content-type": file.content_type}
            )
            # Retrieve public URL
            public_url = supabase_client.storage.from_(bucket).get_public_url(unique_filename)
            logger.info(f"File uploaded to Supabase: {public_url}")
            return public_url
        except Exception as e:
            logger.error(f"Supabase upload failed: {e}. Falling back to local storage.")
            # Fall back to local storage below

    # Local Storage Fallback
    local_path = os.path.join(UPLOAD_DIR, unique_filename)
    try:
        with open(local_path, "wb") as f:
            f.write(file_content)
        # Return a relative URL. FastAPI main.py will mount /static,
        # so this file will be accessible at http://<host>:<port>/static/uploads/<filename>
        public_url = f"/static/uploads/{unique_filename}"
        logger.info(f"File saved locally: {public_url}")
        return public_url
    except Exception as e:
        logger.error(f"Local file save failed: {e}")
        raise RuntimeError(f"Could not save uploaded file: {e}")
