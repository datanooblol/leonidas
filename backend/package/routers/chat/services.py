from fastapi import HTTPException
from datetime import datetime
# from .database import create_message, get_session_messages, get_message_by_id, update_message, delete_message, clear_session_history
from .interface import MessageSend, ChatResponse, ChatHistoryResponse, MessageHistoryResponse
from package.routers.sessions.database import get_session_by_id
from package.routers.projects.database import get_project_by_id
from package.core.config import settings
from package.core.llm import BedrockOpenAI, UserMessage, ModelResponse
from .database import get_history, get_recent_history, create_user_message, create_assistant_message

# Initialize DS Bro
ds_bro = BedrockOpenAI()


DS_BRO_PROMPT = """You are DS Bro, a friendly and expert AI Data Scientist assistant. Your personality:
- Call users "bro" or "buddy" in a friendly way
- Be enthusiastic about data science and analytics
- Provide practical, actionable advice
- Use casual but professional language
- Share insights about data analysis, machine learning, statistics
- Help with data visualization and interpretation
- Give best practices for data science workflows

Always be helpful, accurate, and encouraging while maintaining your friendly "bro" personality."""

def validate_session(user_id, session_id):
    # Verify session
    session = get_session_by_id(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Verify project ownership
    project = get_project_by_id(session.project_id, user_id)  # Use .project_id instead of ['project_id']
    if not project:
        raise HTTPException(status_code=404, detail="Session not found")    

def get_full_chat_history(user_id:str, session_id:str)->ChatHistoryResponse:
    validate_session(user_id, session_id)
    messages = get_history(session_id)
    clean_messages = [
        MessageHistoryResponse(
            message_id=msg.message_id,
            content=msg.content,
            role=msg.role,
            created_at=datetime.fromisoformat(msg.created_at)
        )
        for msg in messages
    ]
    
    return ChatHistoryResponse(
        session_id=session_id,
        messages=clean_messages
    )

def send_message_to_session(user_id: str, session_id: str, message_data: MessageSend) -> ChatResponse:
    """Send message and get AI response"""
    validate_session(user_id, session_id)
    
    # Create user message record
    user_msg = create_user_message(session_id, user_id, message_data.content)
    
    # Get recent history for AI context
    recent_messages = get_recent_history(session_id, 10)
    
    # Build conversation for AI
    conversation = []
    for msg in recent_messages:
        conversation.append(UserMessage(content=msg.content))
    
    # Get AI response
    model_response = ds_bro.run(DS_BRO_PROMPT, conversation)
    
    # Create assistant message record
    ai_msg = create_assistant_message(
        session_id=session_id,
        user_id=user_id,
        content=model_response.content,
        model_name=model_response.model_name,
        input_tokens=model_response.input_tokens,
        output_tokens=model_response.output_tokens,
        response_time_ms=model_response.response_time_ms,
        reason=model_response.reason
    )
    
    return ChatResponse(
        id=ai_msg.message_id,
        role=ai_msg.role,
        content=ai_msg.content,
        response_time_ms=ai_msg.response_time_ms,
        input_tokens=ai_msg.input_tokens,
        output_tokens=ai_msg.output_tokens,
        reason=ai_msg.reason
    )