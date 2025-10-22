from fastapi import HTTPException
from datetime import datetime
from .database import create_message, get_session_messages, get_message_by_id, update_message, delete_message, clear_session_history
from .interface import MessageSend, MessageResponse, ChatResponse, MessageListResponse
from package.routers.sessions.database import get_session_by_id
from package.routers.projects.database import get_project_by_id
from package.core.config import settings
from package.core.llm import BedrockOpenAI, UserMessage

# Initialize DS Bro
ds_bro = BedrockOpenAI()

def generate_ai_response(user_message: str, conversation_history: list = None):
    """Generate DS Bro AI response using Bedrock"""
    try:
        # DS Bro personality
        system_prompt = """You are DS Bro, a friendly and expert AI Data Scientist assistant. Your personality:
        - Call users "bro" or "buddy" in a friendly way
        - Be enthusiastic about data science and analytics
        - Provide practical, actionable advice
        - Use casual but professional language
        - Share insights about data analysis, machine learning, statistics
        - Help with data visualization and interpretation
        - Give best practices for data science workflows
        
        Always be helpful, accurate, and encouraging while maintaining your friendly "bro" personality."""
        
        # Build conversation messages
        messages = conversation_history or []
        messages.append(UserMessage(content=user_message))
        
        # Get AI response
        response = ds_bro.run(system_prompt, messages)
        return response
        
    except Exception as e:
        # Return a fallback ModelResponse
        from package.core.llm import ModelResponse
        return ModelResponse(
            model_name=settings.BEDROCK_MODEL_ID,
            role="assistant",
            content="Hey bro, I'm having some technical difficulties right now. Can you try asking me again in a moment?",
            reason="Error occurred during AI processing",
            input_tokens=0,
            output_tokens=0
        )

def send_message_to_session(session_id: str, user_id: str, message_data: MessageSend) -> ChatResponse:
    """Send message and get AI response"""
    # Verify session exists and user has access
    session = get_session_by_id(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Verify project ownership
    project = get_project_by_id(session['project_id'], user_id)
    if not project:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Create user message
    user_message = create_message(session_id, message_data.content, "user")
    
    # Get conversation history for context
    existing_messages = get_session_messages(session_id)
    conversation_history = []
    
    # Build conversation history (last 10 messages for context)
    for msg in existing_messages[-10:]:
        if msg['role'] == 'user':
            conversation_history.append(UserMessage(content=msg['content']))
        else:
            # Add AI response as model dump format
            conversation_history.append({
                'model_name': ds_bro.model_id,
                'role': 'assistant',
                'content': msg['content'],
                'reason': '',
                'input_tokens': 0,
                'output_tokens': 0
            })
    
    # Generate AI response
    model_response = generate_ai_response(message_data.content, conversation_history)
    ai_message = create_message(session_id, model_response.content, "assistant")
    
    return ChatResponse(
        user_message=MessageResponse(
            id=user_message['message_id'],
            session_id=user_message['session_id'],
            content=user_message['content'],
            role=user_message['role'],
            created_at=datetime.fromisoformat(user_message['created_at'])
        ),
        ai_response=MessageResponse(
            id=ai_message['message_id'],
            session_id=ai_message['session_id'],
            content=ai_message['content'],
            role=ai_message['role'],
            created_at=datetime.fromisoformat(ai_message['created_at'])
        ),
        model_response=model_response
    )

def get_messages_for_session(session_id: str, user_id: str) -> MessageListResponse:
    """Get all messages for session"""
    # Verify session exists and user has access
    session = get_session_by_id(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Verify project ownership
    project = get_project_by_id(session['project_id'], user_id)
    if not project:
        raise HTTPException(status_code=404, detail="Session not found")
    
    messages = get_session_messages(session_id)
    
    message_responses = [
        MessageResponse(
            id=message['message_id'],
            session_id=message['session_id'],
            content=message['content'],
            role=message['role'],
            created_at=datetime.fromisoformat(message['created_at'])
        )
        for message in messages
    ]
    
    return MessageListResponse(messages=message_responses)

def update_chat_message(message_id: str, user_id: str, content: str) -> MessageResponse:
    """Update a chat message"""
    message = get_message_by_id(message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Verify session and project ownership
    session = get_session_by_id(message['session_id'])
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    project = get_project_by_id(session['project_id'], user_id)
    if not project:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Only allow updating user messages
    if message['role'] != 'user':
        raise HTTPException(status_code=400, detail="Cannot edit AI messages")
    
    updated_message = update_message(message_id, content)
    
    return MessageResponse(
        id=updated_message['message_id'],
        session_id=updated_message['session_id'],
        content=updated_message['content'],
        role=updated_message['role'],
        created_at=datetime.fromisoformat(updated_message['created_at'])
    )

def delete_chat_message(message_id: str, user_id: str) -> dict:
    """Delete a chat message"""
    message = get_message_by_id(message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Verify session and project ownership
    session = get_session_by_id(message['session_id'])
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    project = get_project_by_id(session['project_id'], user_id)
    if not project:
        raise HTTPException(status_code=404, detail="Message not found")
    
    success = delete_message(message_id)
    if not success:
        raise HTTPException(status_code=404, detail="Message not found")
    
    return {"message": "Message deleted successfully"}

def clear_chat_history(session_id: str, user_id: str) -> dict:
    """Clear all chat history in a session"""
    session = get_session_by_id(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Verify project ownership
    project = get_project_by_id(session['project_id'], user_id)
    if not project:
        raise HTTPException(status_code=404, detail="Session not found")
    
    clear_session_history(session_id)
    
    return {"message": "Chat history cleared successfully"}