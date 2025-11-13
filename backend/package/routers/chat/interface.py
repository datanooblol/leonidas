from pydantic import BaseModel, Field
from datetime import datetime
from typing import List
from package.llms import Role
from typing import Optional, Any, Literal

class MessageSend(BaseModel):
    content: str
    model_id:str = Field(default="OPENAI_20b_BR")
    chat_with_data: Optional[bool] = Field(default=False, description="Whether to chat with data context")

class Artifact(BaseModel):
    type: Literal["sql", "results", "chart"]
    content: Any
    title: Optional[str] = None

class ArtifactResponse(BaseModel):
    message_id:str
    artifacts: Optional[List[Artifact]] = Field(default=None)

class ChatResponse(BaseModel):
    id:str
    role:Role
    content:str
    model_name:str
    response_time_ms:int
    input_tokens:int
    output_tokens:int
    reason:Optional[str] = Field(description="A reason why LLM answers this way", default=None)
    artifacts:Optional[List[Artifact]] = Field(description="Artifacts can be html, figure, image or else", default=None)

class MessageHistoryResponse(BaseModel):
    message_id: str
    content: str
    role: Role
    created_at: datetime
    model_name: Optional[str] = Field(default=None)

class ChatHistoryResponse(BaseModel):
    session_id: str
    messages: List[MessageHistoryResponse]

# class ChatDataRequest(BaseModel):
#     # session_id:str
#     file_ids:List[str] = Field(description="List of file ids to be used in the chat", default_factory=list)
#     content:str
