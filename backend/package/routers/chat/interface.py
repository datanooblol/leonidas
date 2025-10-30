from pydantic import BaseModel, Field
from datetime import datetime
from typing import List
from package.core.llm import Role
from typing import Optional, Any

# class MessageSend(BaseModel):
#     content: str
class MessageSend(BaseModel):
    content: str
    chat_with_data: Optional[bool] = Field(default=False, description="Whether to chat with data context")
    # file_ids: Optional[List[str]] = Field(default=None, description="Optional list of file ids for data context")

class Artifact(BaseModel):
    type: str
    content: Any
    title: Optional[str] = None

class ChatResponse(BaseModel):
    id:str
    role:Role
    content:str
    response_time_ms:int
    input_tokens:int
    output_tokens:int
    reason:Optional[str] = Field(description="A reason why LLM answers this way", default=None)
    artifacts:Optional[List[Artifact]] = Field(description="Artifacts can be html, figure, image or else", default=None)

# interface.py
class MessageHistoryResponse(BaseModel):
    message_id: str
    content: str
    role: Role
    created_at: datetime

class ChatHistoryResponse(BaseModel):
    session_id: str
    messages: List[MessageHistoryResponse]

class ChatDataRequest(BaseModel):
    # session_id:str
    file_ids:List[str] = Field(description="List of file ids to be used in the chat", default_factory=list)
    content:str
