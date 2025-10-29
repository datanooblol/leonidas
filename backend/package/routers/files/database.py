import boto3
from datetime import datetime, timezone
from uuid import uuid4
from typing import List, Optional
from package.core.config import settings
from pydantic import BaseModel, Field
from enum import Enum
from package.core.interface import FieldDetail

dynamodb = boto3.resource('dynamodb', region_name=settings.AWS_REGION)
files_table = dynamodb.Table(settings.FILES_TABLE)

class FileStatus(str, Enum):
    UPLOADING = "uploading"
    COMPLETED = "completed"
    PROCESSING = "processing"
    FAILED = "failed"

class FileSource(str, Enum):
    USER_UPLOAD = "user_upload"
    APP_GENERATED = "app_generated"

# class FileDB(BaseModel):
#     file_id: str = Field(default_factory=lambda: str(uuid4()))
#     project_id: str
#     filename: str
#     s3_key: str
#     size: int
#     status: FileStatus = Field(default=FileStatus.UPLOADING)
#     source: FileSource = Field(default=FileSource.USER_UPLOAD)
#     created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
#     updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class FileDB(BaseModel):
    file_id: str = Field(default_factory=lambda: str(uuid4()))
    project_id: str
    filename: str
    s3_key: str
    size: int
    status: FileStatus = Field(default=FileStatus.UPLOADING)
    source: FileSource = Field(default=FileSource.USER_UPLOAD)
    name: str = Field(default="")
    description: str = Field(default="")
    columns: List[FieldDetail] = Field(default_factory=list)
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


def create_file_record(project_id: str, filename: str, s3_key: str, size: int, file_id: str = None, status: FileStatus = FileStatus.UPLOADING, source: FileSource = FileSource.USER_UPLOAD) -> FileDB:
    """Create file record in DynamoDB"""
    if file_id:
        file_record = FileDB(file_id=file_id, project_id=project_id, filename=filename, s3_key=s3_key, size=size, status=status, source=source)
    else:
        file_record = FileDB(project_id=project_id, filename=filename, s3_key=s3_key, size=size, status=status, source=source)
    
    files_table.put_item(Item=file_record.model_dump())
    return file_record

def get_project_files(project_id: str, status: FileStatus = None) -> List[FileDB]:
    """Get all files for a project, optionally filtered by status"""
    if status:
        response = files_table.query(
            IndexName='ProjectIndex',
            KeyConditionExpression='project_id = :project_id',
            FilterExpression='#status = :status',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':project_id': project_id, ':status': status.value}
        )
    else:
        response = files_table.query(
            IndexName='ProjectIndex',
            KeyConditionExpression='project_id = :project_id',
            ExpressionAttributeValues={':project_id': project_id}
        )
    return [FileDB(**item) for item in response.get('Items', [])]

def get_file_by_id(file_id: str) -> Optional[FileDB]:
    """Get file by ID"""
    response = files_table.get_item(Key={'file_id': file_id})
    item = response.get('Item')
    return FileDB(**item) if item else None

def confirm_file_upload_record(file_id: str, size: int) -> Optional[FileDB]:
    """Confirm file upload and update size and status"""
    file_record = get_file_by_id(file_id)
    if not file_record:
        return None
    
    updated_at = datetime.now(timezone.utc).isoformat()
    
    files_table.update_item(
        Key={'file_id': file_id},
        UpdateExpression='SET size = :size, #status = :status, updated_at = :updated_at',
        ExpressionAttributeNames={'#status': 'status'},
        ExpressionAttributeValues={
            ':size': size,
            ':status': FileStatus.COMPLETED.value,
            ':updated_at': updated_at
        }
    )
    
    # Return updated file record
    file_record.size = size
    file_record.status = FileStatus.COMPLETED
    file_record.updated_at = updated_at
    return file_record

def update_file_status(file_id: str, status: FileStatus) -> Optional[FileDB]:
    """Update file status"""
    file_record = get_file_by_id(file_id)
    if not file_record:
        return None
    
    updated_at = datetime.now(timezone.utc).isoformat()
    
    files_table.update_item(
        Key={'file_id': file_id},
        UpdateExpression='SET #status = :status, updated_at = :updated_at',
        ExpressionAttributeNames={'#status': 'status'},
        ExpressionAttributeValues={
            ':status': status.value,
            ':updated_at': updated_at
        }
    )
    
    # Return updated file record
    file_record.status = status
    file_record.updated_at = updated_at
    return file_record

def update_file_record(file_id: str, new_filename: str) -> Optional[FileDB]:
    """Update file record filename"""
    file_record = get_file_by_id(file_id)
    if not file_record:
        return None
    
    updated_at = datetime.now(timezone.utc).isoformat()
    
    files_table.update_item(
        Key={'file_id': file_id},
        UpdateExpression='SET filename = :filename, updated_at = :updated_at',
        ExpressionAttributeValues={
            ':filename': new_filename,
            ':updated_at': updated_at
        }
    )
    
    # Return updated file record
    file_record.filename = new_filename
    file_record.updated_at = updated_at
    return file_record

def delete_file_record(file_id: str) -> bool:
    """Delete file record"""
    file_record = get_file_by_id(file_id)
    if not file_record:
        return False
    
    files_table.delete_item(Key={'file_id': file_id})
    return True

def update_file_metadata(file_id: str, name: str, description: str, columns: List[FieldDetail]) -> Optional[FileDB]:
    """Update file metadata"""
    file_record = get_file_by_id(file_id)
    if not file_record:
        return None
    
    updated_at = datetime.now(timezone.utc).isoformat()
    columns_dict = [column.model_dump() for column in columns]
    
    files_table.update_item(
        Key={'file_id': file_id},
        UpdateExpression='SET #name = :name, description = :description, #columns = :columns, updated_at = :updated_at',
        ExpressionAttributeNames={'#name': 'name', '#columns': 'columns'},
        ExpressionAttributeValues={
            ':name': name,
            ':description': description,
            ':columns': columns_dict,
            ':updated_at': updated_at
        }
    )
    
    # Return updated file record
    file_record.name = name
    file_record.description = description
    file_record.columns = columns
    file_record.updated_at = updated_at
    return file_record

def get_metadata_by_file_ids(file_ids: List[str]) -> List[FileDB]:
    """Get multiple files by IDs using batch operation"""
    if not file_ids:
        return []
    
    # DynamoDB batch_get_item has a limit of 100 items
    batch_size = 100
    all_files = []
    
    for i in range(0, len(file_ids), batch_size):
        batch_ids = file_ids[i:i + batch_size]
        
        response = dynamodb.batch_get_item(
            RequestItems={
                settings.FILES_TABLE: {
                    'Keys': [{'file_id': file_id} for file_id in batch_ids]
                }
            }
        )
        
        items = response.get('Responses', {}).get(settings.FILES_TABLE, [])
        for item in items:
            # Convert columns dictionaries back to FieldDetail objects
            if 'columns' in item and item['columns']:
                item['columns'] = [FieldDetail(**col) for col in item['columns']]
            all_files.append(FileDB(**item))
    
    return all_files
