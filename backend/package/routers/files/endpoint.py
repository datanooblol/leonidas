from fastapi import APIRouter, Depends
from .interface import PresignedUrlResponse, FileResponse
from .services import generate_presigned_upload_url, generate_presigned_download_url, rename_file, confirm_file_upload, delete_user_file
from package.core.auth_middleware import get_current_user

router = APIRouter()

@router.post("/upload/presigned", response_model=PresignedUrlResponse)
def get_upload_presigned_url(project_id: str, filename: str, current_user: str = Depends(get_current_user)):
    """Get presigned URL for file upload"""
    return generate_presigned_upload_url(project_id, current_user, filename)

@router.get("/download/presigned", response_model=PresignedUrlResponse)
def get_download_presigned_url(file_id: str, current_user: str = Depends(get_current_user)):
    """Get presigned URL for file download"""
    return generate_presigned_download_url(file_id, current_user)

@router.post("/confirm-upload", response_model=FileResponse)
def confirm_upload(file_id: str, size: int, current_user: str = Depends(get_current_user)):
    """Confirm file upload completion"""
    return confirm_file_upload(file_id, current_user, size)

@router.put("/rename", response_model=FileResponse)
def rename_file_endpoint(file_id: str, new_filename: str, current_user: str = Depends(get_current_user)):
    """Rename file"""
    return rename_file(file_id, current_user, new_filename)

@router.delete("/{file_id}")
def delete_file(file_id: str, current_user: str = Depends(get_current_user)):
    """Delete file from S3 and database"""
    return delete_user_file(file_id, current_user)