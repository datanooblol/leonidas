from fastapi import APIRouter, Depends
from .interface import PresignedUrlResponse, FileResponse
from .services import generate_presigned_download_url, rename_file, confirm_file_upload, delete_user_file, update_file_metadata_service, get_file_metadata_service
from package.core.auth_middleware import get_current_user
from package.core.interface import FileMetadata

router = APIRouter()

@router.get("/{file_id}/download-url", response_model=PresignedUrlResponse)
def get_download_url(file_id: str, current_user: str = Depends(get_current_user)):
    """Get presigned URL for file download"""
    return generate_presigned_download_url(file_id, current_user)

@router.post("/{file_id}/confirm", response_model=FileResponse)
def confirm_upload(file_id: str, size: int, current_user: str = Depends(get_current_user)):
    """Confirm file upload completion"""
    return confirm_file_upload(file_id, current_user, size)

@router.put("/{file_id}/rename", response_model=FileResponse)
def rename_file_endpoint(file_id: str, new_filename: str, current_user: str = Depends(get_current_user)):
    """Rename file"""
    return rename_file(file_id, current_user, new_filename)

@router.delete("/{file_id}")
def delete_file(file_id: str, current_user: str = Depends(get_current_user)):
    """Delete file from S3 and database"""
    return delete_user_file(file_id, current_user)

@router.get("/{file_id}/metadata", response_model=FileMetadata)
def get_metadata(file_id: str, current_user: str = Depends(get_current_user)):
    """Get file metadata"""
    return get_file_metadata_service(file_id, current_user)

@router.patch("/{file_id}/metadata", response_model=FileResponse)
def update_metadata(file_id: str, metadata: FileMetadata, current_user: str = Depends(get_current_user)):
    """Update file metadata"""
    return update_file_metadata_service(file_id, current_user, metadata)
