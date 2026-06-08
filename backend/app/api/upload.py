# FILE NAME: d:\Omkar\Water\FDA\backend\app\api\upload.py

from fastapi import APIRouter, UploadFile, File, HTTPException, status
from ..services.supabase_storage import upload_file

router = APIRouter(prefix="/api/upload", tags=["upload"])

@router.post("/", status_code=status.HTTP_201_CREATED)
async def upload_evidence_file(file: UploadFile = File(...)):
    """Uploads a single file (image/video/doc) to Supabase Storage bucket (or falls back to local disk storage).
    Returns the public URL of the uploaded asset.
    """
    # Verify file type is allowed
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format: {file.content_type}. Only JPEG, PNG, WEBP, GIF, and PDF files are allowed."
        )

    try:
        public_url = await upload_file(file)
        return {"url": public_url}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"File upload failed: {str(e)}"
        )
