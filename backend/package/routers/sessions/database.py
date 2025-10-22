import boto3
from datetime import datetime, timezone
from uuid import uuid4
from typing import List, Optional
from package.core.config import settings

dynamodb = boto3.resource('dynamodb', region_name=settings.AWS_REGION)
sessions_table = dynamodb.Table(settings.SESSIONS_TABLE)

def create_session(project_id: str, name: str) -> dict:
    """Create new session in DynamoDB"""
    session_id = str(uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    item = {
        'session_id': session_id,
        'project_id': project_id,
        'name': name,
        'created_at': now,
        'updated_at': now
    }
    
    sessions_table.put_item(Item=item)
    return item

def get_project_sessions(project_id: str) -> List[dict]:
    """Get all sessions for a project"""
    response = sessions_table.query(
        IndexName='ProjectIndex',
        KeyConditionExpression='project_id = :project_id',
        ExpressionAttributeValues={':project_id': project_id}
    )
    return response.get('Items', [])

def get_session_by_id(session_id: str) -> Optional[dict]:
    """Get session by ID"""
    response = sessions_table.get_item(Key={'session_id': session_id})
    return response.get('Item')

def update_session(session_id: str, name: str) -> Optional[dict]:
    """Update session"""
    session = get_session_by_id(session_id)
    if not session:
        return None
    
    updated_at = datetime.now(timezone.utc).isoformat()
    
    sessions_table.update_item(
        Key={'session_id': session_id},
        UpdateExpression='SET #name = :name, updated_at = :updated_at',
        ExpressionAttributeNames={'#name': 'name'},
        ExpressionAttributeValues={
            ':name': name,
            ':updated_at': updated_at
        }
    )
    
    session['name'] = name
    session['updated_at'] = updated_at
    return session

def refresh_session(session_id: str) -> Optional[dict]:
    """Refresh/restart session by updating timestamp"""
    session = get_session_by_id(session_id)
    if not session:
        return None
    
    updated_at = datetime.now(timezone.utc).isoformat()
    
    sessions_table.update_item(
        Key={'session_id': session_id},
        UpdateExpression='SET updated_at = :updated_at',
        ExpressionAttributeValues={':updated_at': updated_at}
    )
    
    session['updated_at'] = updated_at
    return session

def delete_session(session_id: str) -> bool:
    """Delete session"""
    session = get_session_by_id(session_id)
    if not session:
        return False
    
    sessions_table.delete_item(Key={'session_id': session_id})
    return True