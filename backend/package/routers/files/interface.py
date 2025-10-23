from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from .database import FileStatus, FileSource  # Import enums

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
    created_at: datetime
    updated_at: datetime

class FileListResponse(BaseModel):
    files: List[FileResponse]
