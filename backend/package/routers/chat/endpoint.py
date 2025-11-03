from fastapi import APIRouter, Depends
from .interface import MessageSend, ChatResponse, ChatHistoryResponse
from .services import get_full_chat_history, send_message_with_selected_files
from package.core.auth_middleware import get_current_user
# from package.core.llm import ModelResponse

router = APIRouter()

@router.get("/sessions/{session_id}/chat", response_model=ChatHistoryResponse)
def chat_history(session_id:str, user_id:str=Depends(get_current_user)):
    messages = get_full_chat_history(user_id, session_id)
    return messages

@router.post("/sessions/{session_id}/chat", response_model=ChatResponse)
def chat_with_selected_files(
    session_id: str, 
    message_data: MessageSend, 
    user_id: str = Depends(get_current_user)
):
    """Chat with optional data context from selected files"""
    return send_message_with_selected_files(user_id, session_id, message_data, message_data.chat_with_data)

