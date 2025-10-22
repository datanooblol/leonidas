import boto3
from datetime import datetime, timezone
from uuid import uuid4
from typing import List, Optional
from package.core.config import settings

dynamodb = boto3.resource('dynamodb', region_name=settings.AWS_REGION)
messages_table = dynamodb.Table(settings.MESSAGES_TABLE)

def create_message(session_id: str, content: str, role: str) -> dict:
    """Create message in DynamoDB"""
    message_id = str(uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    
    item = {
        'message_id': message_id,
        'session_id': session_id,
        'content': content,
        'role': role,
        'created_at': created_at
    }
    
    messages_table.put_item(Item=item)
    return item

def get_session_messages(session_id: str) -> List[dict]:
    """Get all messages for a session"""
    response = messages_table.query(
        IndexName='SessionIndex',
        KeyConditionExpression='session_id = :session_id',
        ExpressionAttributeValues={':session_id': session_id},
        ScanIndexForward=True  # Sort by sort key ascending
    )
    
    return response.get('Items', [])

def get_message_by_id(message_id: str) -> Optional[dict]:
    """Get message by ID"""
    response = messages_table.get_item(Key={'message_id': message_id})
    return response.get('Item')

def update_message(message_id: str, content: str) -> Optional[dict]:
    """Update message content"""
    message = get_message_by_id(message_id)
    if not message:
        return None
    
    messages_table.update_item(
        Key={'message_id': message_id},
        UpdateExpression='SET content = :content',
        ExpressionAttributeValues={':content': content}
    )
    
    message['content'] = content
    return message

def delete_message(message_id: str) -> bool:
    """Delete message"""
    message = get_message_by_id(message_id)
    if not message:
        return False
    
    messages_table.delete_item(Key={'message_id': message_id})
    return True

def clear_session_history(session_id: str) -> bool:
    """Clear all messages in a session"""
    messages = get_session_messages(session_id)
    
    for message in messages:
        messages_table.delete_item(Key={'message_id': message['message_id']})
    
    return True