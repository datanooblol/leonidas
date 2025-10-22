from fastapi import APIRouter, Depends
from .interface import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectListResponse
from .services import create_user_project, get_projects_for_user, get_project_details, update_user_project, delete_user_project
from package.routers.sessions.interface import SessionCreate, SessionListResponse, SessionResponse
from package.routers.sessions.services import create_project_session, get_sessions_for_project
from package.routers.files.interface import FileListResponse, PresignedUrlResponse
from package.routers.files.services import get_files_for_project, generate_presigned_upload_url
from package.core.auth_middleware import get_current_user

router = APIRouter()

@router.get("", response_model=ProjectListResponse)
def list_projects(current_user: str = Depends(get_current_user)):
    """List user's projects"""
    return get_projects_for_user(current_user)

@router.post("", response_model=ProjectResponse)
def create_project(project_data: ProjectCreate, current_user: str = Depends(get_current_user)):
    """Create new project"""
    return create_user_project(current_user, project_data)

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, current_user: str = Depends(get_current_user)):
    """Get project details"""
    return get_project_details(project_id, current_user)

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: str, project_data: ProjectUpdate, current_user: str = Depends(get_current_user)):
    """Update project"""
    return update_user_project(project_id, current_user, project_data)

@router.delete("/{project_id}")
def delete_project(project_id: str, current_user: str = Depends(get_current_user)):
    """Delete project"""
    return delete_user_project(project_id, current_user)

@router.get("/{project_id}/sessions", response_model=SessionListResponse)
def list_project_sessions(project_id: str, current_user: str = Depends(get_current_user)):
    """List sessions in project"""
    return get_sessions_for_project(project_id, current_user)

@router.post("/{project_id}/sessions", response_model=SessionResponse)
def create_session(project_id: str, session_data: SessionCreate, current_user: str = Depends(get_current_user)):
    """Create new session in project"""
    return create_project_session(project_id, current_user, session_data)

@router.get("/{project_id}/files", response_model=FileListResponse)
def list_project_files(project_id: str, current_user: str = Depends(get_current_user)):
    """List files in project"""
    return get_files_for_project(project_id, current_user)

@router.post("/{project_id}/files/upload-url", response_model=PresignedUrlResponse)
def get_upload_url(project_id: str, filename: str, current_user: str = Depends(get_current_user)):
    """Get presigned URL for file upload"""
    return generate_presigned_upload_url(project_id, current_user, filename)