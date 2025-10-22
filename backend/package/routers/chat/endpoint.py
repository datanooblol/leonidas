from fastapi import APIRouter, Depends
from .interface import MessageSend, ChatResponse, MessageListResponse, MessageUpdate, MessageResponse
from .services import send_message_to_session, get_messages_for_session, update_chat_message, delete_chat_message, clear_chat_history
from package.core.auth_middleware import get_current_user

router = APIRouter()

@router.post("/sessions/{session_id}/messages", response_model=ChatResponse)
def send_message(session_id: str, message_data: MessageSend, current_user: str = Depends(get_current_user)):
    """Send message and get AI response"""
    return send_message_to_session(session_id, current_user, message_data)

@router.get("/sessions/{session_id}/messages", response_model=MessageListResponse)
def get_messages(session_id: str, current_user: str = Depends(get_current_user)):
    """Get message history for session"""
    return get_messages_for_session(session_id, current_user)

@router.put("/messages/{message_id}", response_model=MessageResponse)
def update_message(message_id: str, message_data: MessageUpdate, current_user: str = Depends(get_current_user)):
    """Update a chat message (user messages only)"""
    return update_chat_message(message_id, current_user, message_data.content)

@router.delete("/messages/{message_id}")
def delete_message(message_id: str, current_user: str = Depends(get_current_user)):
    """Delete a chat message"""
    return delete_chat_message(message_id, current_user)

@router.delete("/sessions/{session_id}/messages")
def clear_history(session_id: str, current_user: str = Depends(get_current_user)):
    """Clear all chat history in session"""
    return clear_chat_history(session_id, current_user)