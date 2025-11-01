from datetime import datetime, timezone
from uuid import uuid4
from pydantic import BaseModel, Field

class Session(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid4()))
    project_id: str
    name: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())