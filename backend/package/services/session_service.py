from datetime import datetime, timezone
from fastapi import HTTPException
from typing import List
from package.core.repositories import SessionRepository, ProjectRepository
from package.schemas.session import Session
from package.routers.sessions.interface import SessionCreate, SessionUpdate, SessionResponse, SessionListResponse

class SessionService:
    def __init__(self, session_repo: SessionRepository, project_repo: ProjectRepository):
        self.session_repo = session_repo
        self.project_repo = project_repo
    
    async def create_session(self, project_id: str, user_id: str, session_data: SessionCreate) -> SessionResponse:
        """Create new session"""
        # Verify project ownership
        project = await self.project_repo.get_by_id_and_user(project_id, user_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        session = Session(
            project_id=project_id,
            name=session_data.name
        )
        created_session = await self.session_repo.create(session)
        
        return SessionResponse(
            session_id=created_session.session_id,
            project_id=created_session.project_id,
            name=created_session.name,
            created_at=datetime.fromisoformat(created_session.created_at),
            updated_at=datetime.fromisoformat(created_session.updated_at)
        )
    
    async def get_project_sessions(self, project_id: str, user_id: str) -> SessionListResponse:
        """Get all sessions for a project"""
        # Verify project ownership
        project = await self.project_repo.get_by_id_and_user(project_id, user_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        sessions = await self.session_repo.get_by_project_id(project_id)
        
        session_responses = [
            SessionResponse(
                session_id=session.session_id,
                project_id=session.project_id,
                name=session.name,
                created_at=datetime.fromisoformat(session.created_at),
                updated_at=datetime.fromisoformat(session.updated_at)
            )
            for session in sessions
        ]
        
        return SessionListResponse(sessions=session_responses)
    
    async def get_session(self, session_id: str, user_id: str) -> SessionResponse:
        """Get session by ID with ownership check"""
        session = await self.session_repo.get_by_id(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Verify project ownership
        project = await self.project_repo.get_by_id_and_user(session.project_id, user_id)
        if not project:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return SessionResponse(
            session_id=session.session_id,
            project_id=session.project_id,
            name=session.name,
            created_at=datetime.fromisoformat(session.created_at),
            updated_at=datetime.fromisoformat(session.updated_at)
        )
    
    async def update_session(self, session_id: str, user_id: str, session_data: SessionUpdate) -> SessionResponse:
        """Update session"""
        session = await self.session_repo.get_by_id(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Verify project ownership
        project = await self.project_repo.get_by_id_and_user(session.project_id, user_id)
        if not project:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Update session
        updated_at = datetime.now(timezone.utc).isoformat()
        updated_session = await self.session_repo.update(
            session_id,
            name=session_data.name,
            updated_at=updated_at
        )
        
        return SessionResponse(
            session_id=updated_session.session_id,
            project_id=updated_session.project_id,
            name=updated_session.name,
            created_at=datetime.fromisoformat(updated_session.created_at),
            updated_at=datetime.fromisoformat(updated_session.updated_at)
        )
    
    async def refresh_session(self, session_id: str, user_id: str) -> SessionResponse:
        """Refresh session timestamp"""
        session = await self.session_repo.get_by_id(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Verify project ownership
        project = await self.project_repo.get_by_id_and_user(session.project_id, user_id)
        if not project:
            raise HTTPException(status_code=404, detail="Session not found")
        
        refreshed_session = await self.session_repo.refresh_timestamp(session_id)
        
        return SessionResponse(
            session_id=refreshed_session.session_id,
            project_id=refreshed_session.project_id,
            name=refreshed_session.name,
            created_at=datetime.fromisoformat(refreshed_session.created_at),
            updated_at=datetime.fromisoformat(refreshed_session.updated_at)
        )
    
    async def delete_session(self, session_id: str, user_id: str) -> bool:
        """Delete session"""
        session = await self.session_repo.get_by_id(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Verify project ownership
        project = await self.project_repo.get_by_id_and_user(session.project_id, user_id)
        if not project:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return await self.session_repo.delete(session_id)

    async def count_by_project_id(self, project_id: str) -> int:
        return await self.session_repo.count_by_project_id(project_id)
