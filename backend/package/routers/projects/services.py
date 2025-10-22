from fastapi import HTTPException
from datetime import datetime
from .database import create_project, get_user_projects, get_project_by_id, update_project, delete_project
from .interface import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectListResponse

def create_user_project(user_id: str, project_data: ProjectCreate) -> ProjectResponse:
    """Create new project for user"""
    project = create_project(user_id, project_data.name, project_data.description)
    
    return ProjectResponse(
        id=project['project_id'],
        name=project['name'],
        description=project['description'],
        created_at=datetime.fromisoformat(project['created_at']),
        updated_at=datetime.fromisoformat(project['updated_at'])
    )

def get_projects_for_user(user_id: str) -> ProjectListResponse:
    """Get all projects for user"""
    projects = get_user_projects(user_id)
    
    project_responses = [
        ProjectResponse(
            id=project['project_id'],
            name=project['name'],
            description=project['description'],
            created_at=datetime.fromisoformat(project['created_at']),
            updated_at=datetime.fromisoformat(project['updated_at'])
        )
        for project in projects
    ]
    
    return ProjectListResponse(projects=project_responses)

def get_project_details(project_id: str, user_id: str) -> ProjectResponse:
    """Get project details"""
    project = get_project_by_id(project_id, user_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return ProjectResponse(
        id=project['project_id'],
        name=project['name'],
        description=project['description'],
        created_at=datetime.fromisoformat(project['created_at']),
        updated_at=datetime.fromisoformat(project['updated_at'])
    )

def update_user_project(project_id: str, user_id: str, project_data: ProjectUpdate) -> ProjectResponse:
    """Update project"""
    project = update_project(project_id, user_id, project_data.name, project_data.description)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return ProjectResponse(
        id=project['project_id'],
        name=project['name'],
        description=project['description'],
        created_at=datetime.fromisoformat(project['created_at']),
        updated_at=datetime.fromisoformat(project['updated_at'])
    )

def delete_user_project(project_id: str, user_id: str) -> dict:
    """Delete project"""
    success = delete_project(project_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return {"message": "Project deleted successfully"}