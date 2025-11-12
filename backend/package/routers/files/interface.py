from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
# from .database import FileStatus, FileSource  # Import enums
from enum import StrEnum
from datetime import datetime, timezone
from package.core.interface import FieldDetail

class FileStatus(StrEnum):
    UPLOADING = "uploading"
    COMPLETED = "completed"
    PROCESSING = "processing"
    FAILED = "failed"

class FileSource(StrEnum):
    USER_UPLOAD = "user_upload"
    APP_GENERATED = "app_generated"

class PresignedUrlResponse(BaseModel):
    url: str
    file_id: str
    fields: Optional[dict] = None

class FileResponse(BaseModel):
    file_id: str
    project_id: str
    filename: str
    size: int
    status: FileStatus  # Add status field
    source: FileSource  # Add source field
    selected: bool
    created_at: datetime
    updated_at: datetime

class FileListResponse(BaseModel):
    files: List[FileResponse]

class FileMetadataResponse(FileResponse):
    name: str
    description: str
    selected: bool
    columns: List[FieldDetail]