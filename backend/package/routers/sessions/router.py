from fastapi import APIRouter, Depends, HTTPException
from package.core.dependencies import get_session_service
from package.services.session_service import SessionService
from package.core.auth_middleware import get_current_user
from .interface import SessionCreate, SessionUpdate, SessionResponse, SessionListResponse

router = APIRouter(prefix="/sessions", tags=["sessions"])

@router.post("/projects/{project_id}/sessions", response_model=SessionResponse)
async def create_session(
    project_id: str,
    session_data: SessionCreate,
    session_service: SessionService = Depends(get_session_service),
    current_user: str = Depends(get_current_user)
):
    return await session_service.create_session(project_id, current_user, session_data)

@router.get("/projects/{project_id}/sessions", response_model=SessionListResponse)
async def get_project_sessions(
    project_id: str,
    session_service: SessionService = Depends(get_session_service),
    current_user: str = Depends(get_current_user)
):
    return await session_service.get_project_sessions(project_id, current_user)

@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: str,
    session_service: SessionService = Depends(get_session_service),
    current_user: str = Depends(get_current_user)
):
    return await session_service.get_session(session_id, current_user)

@router.put("/{session_id}", response_model=SessionResponse)
async def update_session(
    session_id: str,
    session_data: SessionUpdate,
    session_service: SessionService = Depends(get_session_service),
    current_user: str = Depends(get_current_user)
):
    return await session_service.update_session(session_id, current_user, session_data)

@router.post("/{session_id}/refresh", response_model=SessionResponse)
async def refresh_session(
    session_id: str,
    session_service: SessionService = Depends(get_session_service),
    current_user: str = Depends(get_current_user)
):
    return await session_service.refresh_session(session_id, current_user)

@router.delete("/{session_id}")
async def delete_session(
    session_id: str,
    session_service: SessionService = Depends(get_session_service),
    current_user: str = Depends(get_current_user)
):
    success = await session_service.delete_session(session_id, current_user)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Session deleted successfully"}