from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from package.core.dependencies import get_file_service
from package.services.file_service import FileService
from package.core.auth_middleware import get_current_user
from package.schemas.file import FileStatus, FileSource
from package.core.interface import FieldDetail
from .interface import FileResponse, FileListResponse, PresignedUrlResponse
from package.routers.files.services import generate_presigned_upload_url

router = APIRouter(prefix="/files", tags=["files"])

@router.post("/projects/{project_id}/files", response_model=FileResponse)
async def create_file_record(
    project_id: str,
    filename: str,
    s3_key: str,
    size: int,
    file_id: Optional[str] = None,
    status: FileStatus = FileStatus.UPLOADING,
    source: FileSource = FileSource.USER_UPLOAD,
    file_service: FileService = Depends(get_file_service),
    current_user: str = Depends(get_current_user)
):
    return await file_service.create_file_record(
        project_id, current_user, filename, s3_key, size, file_id, status, source
    )

@router.get("/projects/{project_id}/files", response_model=FileListResponse)
async def get_project_files(
    project_id: str,
    status: Optional[str] = Query(None),
    file_service: FileService = Depends(get_file_service),
    current_user: str = Depends(get_current_user)
):
    return await file_service.get_project_files(project_id, current_user, status)

@router.get("/projects/{project_id}/files/selected", response_model=FileListResponse)
async def get_selected_files(
    project_id: str,
    file_service: FileService = Depends(get_file_service),
    current_user: str = Depends(get_current_user)
):
    return await file_service.get_selected_files(project_id, current_user)

@router.get("/{file_id}", response_model=FileResponse)
async def get_file(
    file_id: str,
    file_service: FileService = Depends(get_file_service),
    current_user: str = Depends(get_current_user)
):
    return await file_service.get_file(file_id, current_user)

@router.patch("/{file_id}/status", response_model=FileResponse)
async def update_file_status(
    file_id: str,
    status: str,
    file_service: FileService = Depends(get_file_service),
    current_user: str = Depends(get_current_user)
):
    return await file_service.update_file_status(file_id, current_user, status)

@router.patch("/{file_id}/metadata", response_model=FileResponse)
async def update_file_metadata(
    file_id: str,
    name: str,
    description: str,
    columns: List[FieldDetail],
    file_service: FileService = Depends(get_file_service),
    current_user: str = Depends(get_current_user)
):
    return await file_service.update_file_metadata(file_id, current_user, name, description, columns)

@router.patch("/{file_id}/selection", response_model=FileResponse)
async def update_file_selection(
    file_id: str,
    selected: bool,
    file_service: FileService = Depends(get_file_service),
    current_user: str = Depends(get_current_user)
):
    return await file_service.update_file_selection(file_id, current_user, selected)

@router.post("/{file_id}/confirm", response_model=FileResponse)
async def confirm_file_upload(
    file_id: str,
    size: int,
    file_service: FileService = Depends(get_file_service),
    current_user: str = Depends(get_current_user)
):
    return await file_service.confirm_file_upload(file_id, current_user, size)

@router.delete("/{file_id}")
async def delete_file(
    file_id: str,
    file_service: FileService = Depends(get_file_service),
    current_user: str = Depends(get_current_user)
):
    success = await file_service.delete_file(file_id, current_user)
    if not success:
        raise HTTPException(status_code=404, detail="File not found")
    return {"message": "File deleted successfully"}

@router.post("/{project_id}/upload-url", response_model=PresignedUrlResponse)
def get_upload_url(project_id: str, filename: str, current_user: str = Depends(get_current_user)):
    """Get presigned URL for file upload"""
    return generate_presigned_upload_url(project_id, current_user, filename)