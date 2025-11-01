from datetime import datetime, timezone
from uuid import uuid4
from typing import Optional
from pydantic import BaseModel, Field, EmailStr

class User(BaseModel):
    user_id: str = Field(default_factory=lambda: str(uuid4()))
    email: EmailStr
    password_hash: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    is_verified: bool = Field(default=False)
    updated_at: Optional[str] = None