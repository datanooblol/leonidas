from datetime import datetime, timezone
from uuid import uuid4
from typing import List
from pydantic import BaseModel, Field
from enum import Enum
from package.core.interface import FieldDetail

class FileStatus(str, Enum):
    UPLOADING = "uploading"
    COMPLETED = "completed"
    PROCESSING = "processing"
    FAILED = "failed"

class FileSource(str, Enum):
    USER_UPLOAD = "user_upload"
    APP_GENERATED = "app_generated"

class File(BaseModel):
    file_id: str = Field(default_factory=lambda: str(uuid4()))
    project_id: str
    filename: str
    s3_key: str
    size: int
    status: FileStatus = Field(default=FileStatus.UPLOADING)
    source: FileSource = Field(default=FileSource.USER_UPLOAD)
    name: str = Field(default="")
    description: str = Field(default="")
    selected: bool = Field(default=False)
    columns: List[FieldDetail] = Field(default_factory=list)
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())