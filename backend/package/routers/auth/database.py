import boto3
from datetime import datetime, timezone
from uuid import uuid4
from typing import Optional
from package.core.config import settings

dynamodb = boto3.resource('dynamodb', region_name=settings.AWS_REGION)
users_table = dynamodb.Table(settings.USERS_TABLE)

def create_user(email: str, password_hash: str) -> dict:
    """Create new user in DynamoDB"""
    user_id = str(uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    
    item = {
        'user_id': user_id,
        'email': email,
        'password_hash': password_hash,
        'created_at': created_at
    }
    
    users_table.put_item(Item=item)
    return item

def get_user_by_email(email: str) -> Optional[dict]:
    """Get user by email"""
    response = users_table.scan(
        FilterExpression='email = :email',
        ExpressionAttributeValues={':email': email}
    )
    
    items = response.get('Items', [])
    return items[0] if items else None

def get_user_by_id(user_id: str) -> Optional[dict]:
    """Get user by ID"""
    response = users_table.get_item(Key={'user_id': user_id})
    return response.get('Item')