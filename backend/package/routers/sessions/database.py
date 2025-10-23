import boto3
from datetime import datetime, timezone
from uuid import uuid4
from typing import List, Optional
from package.core.config import settings
from pydantic import BaseModel, Field

dynamodb = boto3.resource('dynamodb', region_name=settings.AWS_REGION)
sessions_table = dynamodb.Table(settings.SESSIONS_TABLE)

class SessionDB(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid4()))
    project_id: str
    name: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

def create_session(project_id: str, name: str) -> SessionDB:
    """Create new session in DynamoDB"""
    session = SessionDB(project_id=project_id, name=name)
    sessions_table.put_item(Item=session.model_dump())
    return session

def get_project_sessions(project_id: str) -> List[SessionDB]:
    """Get all sessions for a project"""
    response = sessions_table.query(
        IndexName='ProjectIndex',
        KeyConditionExpression='project_id = :project_id',
        ExpressionAttributeValues={':project_id': project_id}
    )
    return [SessionDB(**item) for item in response.get('Items', [])]

def get_session_by_id(session_id: str) -> Optional[SessionDB]:
    """Get session by ID"""
    response = sessions_table.get_item(Key={'session_id': session_id})
    item = response.get('Item')
    return SessionDB(**item) if item else None

def update_session(session_id: str, name: str) -> Optional[SessionDB]:
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
    
    # Return updated session
    session.name = name
    session.updated_at = updated_at
    return session

def refresh_session(session_id: str) -> Optional[SessionDB]:
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
    
    # Return refreshed session
    session.updated_at = updated_at
    return session

def delete_session(session_id: str) -> bool:
    """Delete session"""
    session = get_session_by_id(session_id)
    if not session:
        return False
    
    sessions_table.delete_item(Key={'session_id': session_id})
    return True
