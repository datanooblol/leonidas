import boto3
from datetime import datetime, timezone
from uuid import uuid4
from typing import List, Optional
from package.core.config import settings

dynamodb = boto3.resource('dynamodb', region_name=settings.AWS_REGION)
files_table = dynamodb.Table(settings.FILES_TABLE)

def create_file_record(project_id: str, filename: str, s3_key: str, size: int, file_id: str = None) -> dict:
    """Create file record in DynamoDB"""
    if file_id is None:
        file_id = str(uuid4())
    
    now = datetime.now(timezone.utc).isoformat()
    
    item = {
        'file_id': file_id,
        'project_id': project_id,
        'filename': filename,
        's3_key': s3_key,
        'size': size,
        'created_at': now,
        'updated_at': now
    }
    
    files_table.put_item(Item=item)
    return item

def get_project_files(project_id: str) -> List[dict]:
    """Get all files for a project"""
    response = files_table.query(
        IndexName='ProjectIndex',
        KeyConditionExpression='project_id = :project_id',
        ExpressionAttributeValues={':project_id': project_id}
    )
    return response.get('Items', [])

def get_file_by_id(file_id: str) -> Optional[dict]:
    """Get file by ID"""
    response = files_table.get_item(Key={'file_id': file_id})
    return response.get('Item')

def confirm_file_upload_record(file_id: str, size: int) -> dict:
    """Confirm file upload and update size"""
    file_record = get_file_by_id(file_id)
    if not file_record:
        return None
    
    updated_at = datetime.now(timezone.utc).isoformat()
    
    files_table.update_item(
        Key={'file_id': file_id},
        UpdateExpression='SET size = :size, updated_at = :updated_at',
        ExpressionAttributeValues={
            ':size': size,
            ':updated_at': updated_at
        }
    )
    
    file_record['size'] = size
    file_record['updated_at'] = updated_at
    return file_record

def update_file_record(file_id: str, new_filename: str) -> dict:
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
    
    file_record['filename'] = new_filename
    file_record['updated_at'] = updated_at
    return file_record

def delete_file_record(file_id: str) -> bool:
    """Delete file record"""
    file_record = get_file_by_id(file_id)
    if not file_record:
        return False
    
    files_table.delete_item(Key={'file_id': file_id})
    return True