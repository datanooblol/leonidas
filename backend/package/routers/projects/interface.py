from pydantic import BaseModel, Field
from datetime import datetime
from typing import List

class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., max_length=500)

class ProjectUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., max_length=500)

class ProjectResponse(BaseModel):
    project_id: str  # Changed from 'id' to match database field
    name: str
    description: str
    created_at: datetime
    updated_at: datetime
    file_count: int = 0
    session_count: int = 0

class ProjectListResponse(BaseModel):
    projects: List[ProjectResponse]
