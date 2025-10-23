import boto3
from datetime import datetime, timezone
from uuid import uuid4
from typing import Optional
from package.core.config import settings
from pydantic import BaseModel, Field, EmailStr

dynamodb = boto3.resource('dynamodb', region_name=settings.AWS_REGION)
users_table = dynamodb.Table(settings.USERS_TABLE)

class UserDB(BaseModel):
    user_id: str = Field(default_factory=lambda: str(uuid4()))
    email: EmailStr
    password_hash: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    is_verified: bool = Field(default=False)
    updated_at: Optional[str] = None

def create_user(email: str, password_hash: str) -> UserDB:
    user = UserDB(email=email, password_hash=password_hash)
    users_table.put_item(Item=user.model_dump())
    return user

def get_user_by_email(email: str) -> Optional[UserDB]:
    # Still need scan since no GSI on email in your Terraform
    response = users_table.scan(
        FilterExpression='email = :email',
        ExpressionAttributeValues={':email': email}
    )
    items = response.get('Items', [])
    return UserDB(**items[0]) if items else None

def get_user_by_id(user_id: str) -> Optional[UserDB]:
    response = users_table.get_item(Key={'user_id': user_id})
    item = response.get('Item')
    return UserDB(**item) if item else None


# def create_user(email: str, password_hash: str) -> dict:
#     """Create new user in DynamoDB"""
#     user_id = str(uuid4())
#     created_at = datetime.now(timezone.utc).isoformat()
    
#     item = {
#         'user_id': user_id,
#         'email': email,
#         'password_hash': password_hash,
#         'created_at': created_at
#     }
    
#     users_table.put_item(Item=item)
#     return item

# def get_user_by_email(email: str) -> Optional[dict]:
#     """Get user by email"""
#     response = users_table.scan(
#         FilterExpression='email = :email',
#         ExpressionAttributeValues={':email': email}
#     )
    
#     items = response.get('Items', [])
#     return items[0] if items else None

# def get_user_by_id(user_id: str) -> Optional[dict]:
#     """Get user by ID"""
#     response = users_table.get_item(Key={'user_id': user_id})
#     return response.get('Item')