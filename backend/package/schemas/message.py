from datetime import datetime, timezone
from uuid import uuid4
from typing import List, Optional
from pydantic import BaseModel, Field
from package.llms import Role

class Message(BaseModel):
    message_id: str = Field(default_factory=lambda: str(uuid4()))
    session_id: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    content: str
    role: Role
    user_id: str
    model_name: Optional[str] = Field(default=None)
    input_tokens: Optional[int] = Field(default=None)
    output_tokens: Optional[int] = Field(default=None)
    response_time_ms: Optional[int] = Field(default=None)
    reason: Optional[str] = Field(default=None)
    updated_at: Optional[str] = Field(default=None)
    artifacts: Optional[List[dict]] = Field(default=None)