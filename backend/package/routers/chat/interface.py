from pydantic import BaseModel, Field
from datetime import datetime
from typing import List
from package.core.llm import ModelResponse

class MessageSend(BaseModel):
    content: str

class MessageResponse(BaseModel):
    id: str
    session_id: str
    content: str
    role: str  # "user" or "assistant"
    created_at: datetime

class ChatResponse(BaseModel):
    user_message: MessageResponse
    ai_response: MessageResponse
    model_response: ModelResponse

class MessageUpdate(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)

class MessageListResponse(BaseModel):
    messages: List[MessageResponse]

class ChatHistoryResponse(BaseModel):
    session_id: str
    total_messages: int
    messages: List[MessageResponse]