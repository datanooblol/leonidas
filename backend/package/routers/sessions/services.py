from fastapi import HTTPException
from datetime import datetime
from .database import create_session, get_project_sessions, get_session_by_id, update_session, delete_session, refresh_session
from .interface import SessionCreate, SessionUpdate, SessionResponse, SessionListResponse
from package.routers.projects.database import get_project_by_id

def create_project_session(project_id: str, user_id: str, session_data: SessionCreate) -> SessionResponse:
    """Create new session for project"""
    # Verify project ownership
    project = get_project_by_id(project_id, user_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    session = create_session(project_id, session_data.name)
    
    return SessionResponse(
        id=session['session_id'],
        project_id=session['project_id'],
        name=session['name'],
        created_at=datetime.fromisoformat(session['created_at']),
        updated_at=datetime.fromisoformat(session['updated_at'])
    )

def get_sessions_for_project(project_id: str, user_id: str) -> SessionListResponse:
    """Get all sessions for project"""
    # Verify project ownership
    project = get_project_by_id(project_id, user_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    sessions = get_project_sessions(project_id)
    
    session_responses = [
        SessionResponse(
            id=session['session_id'],
            project_id=session['project_id'],
            name=session['name'],
            created_at=datetime.fromisoformat(session['created_at']),
            updated_at=datetime.fromisoformat(session['updated_at'])
        )
        for session in sessions
    ]
    
    return SessionListResponse(sessions=session_responses)

def get_session_details(session_id: str, user_id: str) -> SessionResponse:
    """Get session details"""
    session = get_session_by_id(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Verify project ownership
    project = get_project_by_id(session['project_id'], user_id)
    if not project:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return SessionResponse(
        id=session['session_id'],
        project_id=session['project_id'],
        name=session['name'],
        created_at=datetime.fromisoformat(session['created_at']),
        updated_at=datetime.fromisoformat(session['updated_at'])
    )

def update_user_session(session_id: str, user_id: str, session_data: SessionUpdate) -> SessionResponse:
    """Update session"""
    session = get_session_by_id(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Verify project ownership
    project = get_project_by_id(session['project_id'], user_id)
    if not project:
        raise HTTPException(status_code=404, detail="Session not found")
    
    updated_session = update_session(session_id, session_data.name)
    if not updated_session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return SessionResponse(
        id=updated_session['session_id'],
        project_id=updated_session['project_id'],
        name=updated_session['name'],
        created_at=datetime.fromisoformat(updated_session['created_at']),
        updated_at=datetime.fromisoformat(updated_session['updated_at'])
    )

def refresh_user_session(session_id: str, user_id: str) -> SessionResponse:
    """Refresh/restart session"""
    session = get_session_by_id(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Verify project ownership
    project = get_project_by_id(session['project_id'], user_id)
    if not project:
        raise HTTPException(status_code=404, detail="Session not found")
    
    refreshed_session = refresh_session(session_id)
    if not refreshed_session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return SessionResponse(
        id=refreshed_session['session_id'],
        project_id=refreshed_session['project_id'],
        name=refreshed_session['name'],
        created_at=datetime.fromisoformat(refreshed_session['created_at']),
        updated_at=datetime.fromisoformat(refreshed_session['updated_at'])
    )

def delete_user_session(session_id: str, user_id: str) -> dict:
    """Delete session"""
    session = get_session_by_id(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Verify project ownership
    project = get_project_by_id(session['project_id'], user_id)
    if not project:
        raise HTTPException(status_code=404, detail="Session not found")
    
    success = delete_session(session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {"message": "Session deleted successfully"}