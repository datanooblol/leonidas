from pydantic import BaseModel
from datetime import datetime
from typing import List

class PresignedUrlResponse(BaseModel):
    url: str
    file_id: str = None
    fields: dict = None

class FileResponse(BaseModel):
    id: str
    project_id: str
    filename: str
    size: int
    created_at: datetime

class FileListResponse(BaseModel):
    files: List[FileResponse]