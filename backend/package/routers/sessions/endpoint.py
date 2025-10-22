from fastapi import APIRouter, Depends
from .interface import SessionCreate, SessionUpdate, SessionResponse, SessionListResponse
from .services import create_project_session, get_sessions_for_project, get_session_details, update_user_session, delete_user_session, refresh_user_session
from package.core.auth_middleware import get_current_user

router = APIRouter()

@router.get("/{session_id}", response_model=SessionResponse)
def get_session(session_id: str, current_user: str = Depends(get_current_user)):
    """Get session details"""
    return get_session_details(session_id, current_user)

@router.put("/{session_id}", response_model=SessionResponse)
def update_session(session_id: str, session_data: SessionUpdate, current_user: str = Depends(get_current_user)):
    """Update session"""
    return update_user_session(session_id, current_user, session_data)

@router.post("/{session_id}/refresh", response_model=SessionResponse)
def refresh_session(session_id: str, current_user: str = Depends(get_current_user)):
    """Refresh/restart session"""
    return refresh_user_session(session_id, current_user)

@router.delete("/{session_id}")
def delete_session(session_id: str, current_user: str = Depends(get_current_user)):
    """Delete session"""
    return delete_user_session(session_id, current_user)