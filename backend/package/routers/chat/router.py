from fastapi import APIRouter, Depends
from package.core.dependencies import get_chat_service
from package.services.chat_service import ChatService
from package.core.auth_middleware import get_current_user
from package.llms import ModelFactory
from .interface import MessageSend, ChatResponse, ChatHistoryResponse

router = APIRouter(prefix="/chat", tags=["chat"])

@router.get("/sessions/{session_id}/history", response_model=ChatHistoryResponse)
async def get_chat_history(
    session_id: str,
    chat_service: ChatService = Depends(get_chat_service),
    current_user: str = Depends(get_current_user)
):
    return await chat_service.get_chat_history(session_id, current_user)

@router.post("/sessions/{session_id}/messages", response_model=ChatResponse)
async def send_message(
    session_id: str,
    message_data: MessageSend,
    chat_service: ChatService = Depends(get_chat_service),
    current_user: str = Depends(get_current_user)
):
    return await chat_service.send_message(session_id, current_user, message_data)

@router.get("/available-models")
async def get_available_models(
    current_user: str = Depends(get_current_user)
):
    return dict(models=ModelFactory.get_available_models())