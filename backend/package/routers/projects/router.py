from fastapi import APIRouter, Depends, HTTPException
from package.core.dependencies import get_project_service
from package.services.project_service import ProjectService
from package.core.auth_middleware import get_current_user
from .interface import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectListResponse

router = APIRouter(prefix="/projects", tags=["projects"])

@router.post("/", response_model=ProjectResponse)
async def create_project(
    project_data: ProjectCreate,
    project_service: ProjectService = Depends(get_project_service),
    current_user: str = Depends(get_current_user)
):
    return await project_service.create_project(current_user, project_data)

@router.get("/", response_model=ProjectListResponse)
async def get_projects(
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