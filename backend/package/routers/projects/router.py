from fastapi import APIRouter, Depends, HTTPException, Query
from package.core.dependencies import get_project_service, get_file_service
from package.services.project_service import ProjectService
from package.core.auth_middleware import get_current_user
from .interface import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectListResponse
from package.routers.sessions.interface import SessionCreate, SessionResponse, SessionListResponse
from package.services.session_service import SessionService
from package.core.dependencies import get_session_service
from typing import Optional
from package.services.file_service import FileService
from package.schemas.file import FileStatus, FileSource
from package.routers.files.interface import FileResponse, FileListResponse

router = APIRouter(prefix="/projects", tags=["projects"])

@router.post("/", response_model=ProjectResponse)
async def create_new_project(
    project_data: ProjectCreate,
    project_service: ProjectService = Depends(get_project_service),
    current_user: str = Depends(get_current_user)
):
    return await project_service.create_project(current_user, project_data)

@router.get("/", response_model=ProjectListResponse)
async def list_all_projects(
    project_service: ProjectService = Depends(get_project_service),
    current_user: str = Depends(get_current_user)
):
    return await project_service.get_user_projects(current_user)

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    project_service: ProjectService = Depends(get_project_service),
    current_user: str = Depends(get_current_user)
):
    return await project_service.get_project(project_id, current_user)

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project_data: ProjectUpdate,
    project_service: ProjectService = Depends(get_project_service),
    current_user: str = Depends(get_current_user)
):
    return await project_service.update_project(project_id, current_user, project_data)

@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    project_service: ProjectService = Depends(get_project_service),
    current_user: str = Depends(get_current_user)
):
    success = await project_service.delete_project(project_id, current_user)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted successfully"}

@router.post("/{project_id}/sessions", response_model=SessionResponse)
async def create_new_session(
    project_id: str,
    session_data: SessionCreate,
    session_service: SessionService = Depends(get_session_service),
    current_user: str = Depends(get_current_user)
):
    return await session_service.create_session(project_id, current_user, session_data)

@router.get("/{project_id}/sessions", response_model=SessionListResponse)
async def list_project_sessions(
    project_id: str,
    session_service: SessionService = Depends(get_session_service),
    current_user: str = Depends(get_current_user)
):
    return await session_service.get_project_sessions(project_id, current_user)

@router.post("/{project_id}/files", response_model=FileResponse)
async def create_project_file(
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

@router.get("/{project_id}/files", response_model=FileListResponse)
async def list_project_files(
    project_id: str,
    status: Optional[str] = Query(None),
    file_service: FileService = Depends(get_file_service),
    current_user: str = Depends(get_current_user)
):
    return await file_service.get_project_files(project_id, current_user, status)