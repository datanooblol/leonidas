from pydantic import BaseModel, Field
from datetime import datetime
from typing import List

class SessionCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)

class SessionUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)

class SessionResponse(BaseModel):
    session_id: str  # Changed from 'id' to match database field
    project_id: str
    name: str
    created_at: datetime
    updated_at: datetime

class SessionListResponse(BaseModel):
    sessions: List[SessionResponse]
