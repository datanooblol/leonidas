from datetime import datetime, timezone
from fastapi import HTTPException
from typing import List
from package.core.repositories import ProjectRepository
from package.schemas.project import Project
from package.routers.projects.interface import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectListResponse
from package.core.repositories import ProjectRepository, FileRepository, SessionRepository


class ProjectService:
    def __init__(self, project_repo: ProjectRepository, file_repo: FileRepository, session_repo: SessionRepository):
        self.project_repo = project_repo
        self.file_repo = file_repo
        self.session_repo = session_repo
    
    async def create_project(self, user_id: str, project_data: ProjectCreate) -> ProjectResponse:
        """Create new project"""
        project = Project(
            user_id=user_id,
            name=project_data.name,
            description=project_data.description
        )
        created_project = await self.project_repo.create(project)
        
        return ProjectResponse(
            project_id=created_project.project_id,
            name=created_project.name,
            description=created_project.description,
            created_at=datetime.fromisoformat(created_project.created_at),
            updated_at=datetime.fromisoformat(created_project.updated_at)
        )
    
    async def get_user_projects(self, user_id: str) -> ProjectListResponse:
        """Get all projects for a user with file and session counts"""
        projects = await self.project_repo.get_by_user_id(user_id)
        
        project_responses = []
        for project in projects:
            file_count = await self.file_repo.count_by_project_id(project.project_id)
            session_count = await self.session_repo.count_by_project_id(project.project_id)
            project_responses.append(ProjectResponse(
                project_id=project.project_id,
                name=project.name,
                description=project.description,
                created_at=datetime.fromisoformat(project.created_at),
                updated_at=datetime.fromisoformat(project.updated_at),
                file_count=file_count,
                session_count=session_count
            ))
        
        return ProjectListResponse(projects=project_responses)


    async def get_project(self, project_id: str, user_id: str) -> ProjectResponse:
        """Get project by ID with ownership check"""
        project = await self.project_repo.get_by_id_and_user(project_id, user_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        return ProjectResponse(
            project_id=project.project_id,
            name=project.name,
            description=project.description,
            created_at=datetime.fromisoformat(project.created_at),
            updated_at=datetime.fromisoformat(project.updated_at)
        )
    
    async def update_project(self, project_id: str, user_id: str, project_data: ProjectUpdate) -> ProjectResponse:
        """Update project"""
        # Check ownership first
        existing_project = await self.project_repo.get_by_id_and_user(project_id, user_id)
        if not existing_project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Update project
        updated_at = datetime.now(timezone.utc).isoformat()
        updated_project = await self.project_repo.update(
            project_id,
            name=project_data.name,
            description=project_data.description,
            updated_at=updated_at
        )
        
        return ProjectResponse(
            project_id=updated_project.project_id,
            name=updated_project.name,
            description=updated_project.description,
            created_at=datetime.fromisoformat(updated_project.created_at),
            updated_at=datetime.fromisoformat(updated_project.updated_at)
        )
    
    async def delete_project(self, project_id: str, user_id: str) -> bool:
        """Delete project"""
        # Check ownership first
        existing_project = await self.project_repo.get_by_id_and_user(project_id, user_id)
        if not existing_project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        return await self.project_repo.delete(project_id)