from fastapi import APIRouter, Depends
from .interface import MessageSend, ChatResponse, ChatHistoryResponse
# from .services import send_message_to_session, get_messages_for_session, update_chat_message, delete_chat_message, clear_chat_history
from .services import get_full_chat_history, send_message_to_session
from package.core.auth_middleware import get_current_user
from package.core.llm import ModelResponse

router = APIRouter()

@router.post("/sessions/{session_id}/chat", response_model=ChatResponse)
def chat(session_id: str, message_data: MessageSend, user_id:str=Depends(get_current_user)):
    response = send_message_to_session(user_id, session_id, message_data)
    return ChatResponse(
        id=response.id,
        role=response.role,
        content=response.content,
        reason=response.reason,
        response_time_ms=response.response_time_ms,
        input_tokens=response.input_tokens,
        output_tokens=response.output_tokens,
    )

@router.get("/sessions/{session_id}/chat", response_model=ChatHistoryResponse)
def chat_history(session_id:str, user_id:str=Depends(get_current_user)):
    messages = get_full_chat_history(user_id, session_id)
    return messages