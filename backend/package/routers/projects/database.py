import boto3
from datetime import datetime, timezone
from uuid import uuid4
from typing import List, Optional
from package.core.config import settings

dynamodb = boto3.resource('dynamodb', region_name=settings.AWS_REGION)
projects_table = dynamodb.Table(settings.PROJECTS_TABLE)

def create_project(user_id: str, name: str, description: str) -> dict:
    """Create new project in DynamoDB"""
    project_id = str(uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    item = {
        'project_id': project_id,
        'user_id': user_id,
        'name': name,
        'description': description,
        'created_at': now,
        'updated_at': now
    }
    
    projects_table.put_item(Item=item)
    return item

def get_user_projects(user_id: str) -> List[dict]:
    """Get all projects for a user"""
    response = projects_table.query(
        IndexName='UserIndex',
        KeyConditionExpression='user_id = :user_id',
        ExpressionAttributeValues={':user_id': user_id}
    )
    return response.get('Items', [])

def get_project_by_id(project_id: str, user_id: str) -> Optional[dict]:
    """Get project by ID (with user ownership check)"""
    response = projects_table.get_item(Key={'project_id': project_id})
    project = response.get('Item')
    
    if project and project['user_id'] == user_id:
        return project
    return None

def update_project(project_id: str, user_id: str, name: str, description: str) -> Optional[dict]:
    """Update project"""
    project = get_project_by_id(project_id, user_id)
    if not project:
        return None
    
    updated_at = datetime.now(timezone.utc).isoformat()
    
    projects_table.update_item(
        Key={'project_id': project_id},
        UpdateExpression='SET #name = :name, description = :description, updated_at = :updated_at',
        ExpressionAttributeNames={'#name': 'name'},
        ExpressionAttributeValues={
            ':name': name,
            ':description': description,
            ':updated_at': updated_at
        }
    )
    
    project['name'] = name
    project['description'] = description
    project['updated_at'] = updated_at
    return project

def delete_project(project_id: str, user_id: str) -> bool:
    """Delete project"""
    project = get_project_by_id(project_id, user_id)
    if not project:
        return False
    
    projects_table.delete_item(Key={'project_id': project_id})
    return True