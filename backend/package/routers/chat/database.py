import boto3
from datetime import datetime, timezone
from uuid import uuid4
from typing import List, Optional
from package.core.config import settings
from pydantic import BaseModel, Field
from typing import Optional
from package.core.llm import Role
from uuid import uuid4
from .interface import Artifact

dynamodb = boto3.resource('dynamodb', region_name=settings.AWS_REGION)
messages_table = dynamodb.Table(settings.MESSAGES_TABLE)

class MessageDB(BaseModel):
    message_id:str = Field(default_factory=lambda: str(uuid4()))
    session_id:str
    created_at:str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    content:str
    role:Role
    user_id:str
    model_name:Optional[str] = Field(default=None)
    input_tokens:Optional[int] = Field(default=None)
    output_tokens:Optional[int] = Field(default=None)
    response_time_ms:Optional[int] = Field(default=None)
    reason:Optional[str] = Field(default=None)
    updated_at:Optional[str] = Field(default=None)
    artifacts: Optional[List[dict]] = Field(default=None)
    # artifacts: Optional[List[Artifact]] = Field(default=None)

def get_history(session_id: str, limit: Optional[int] = None) -> List[MessageDB]:
    query_params = {
        "IndexName": "SessionIndex",
        "KeyConditionExpression": "session_id = :sid",
        "ExpressionAttributeValues": {":sid": session_id},
        "ScanIndexForward": True  # Change to True for chronological order (oldest first)
    }

    if limit:
        query_params["Limit"] = limit
    
    response = messages_table.query(**query_params)
    return [MessageDB(**item) for item in response.get("Items", [])]

def get_recent_history(session_id: str, limit: int = 10) -> List[MessageDB]:
    """Get last N messages for AI context (newest first)"""
    query_params = {
        "IndexName": "SessionIndex", 
        "KeyConditionExpression": "session_id = :sid",
        "ExpressionAttributeValues": {":sid": session_id},
        "ScanIndexForward": False,  # Keep False for AI context (newest first)
        "Limit": limit
    }
    
    response = messages_table.query(**query_params)
    return [MessageDB(**item) for item in response.get("Items", [])]

def create_user_message(session_id: str, user_id: str, content: str) -> MessageDB:
    message = MessageDB(
        session_id=session_id,
        user_id=user_id,
        content=content,
        role=Role.USER
    )
    messages_table.put_item(Item=message.model_dump())
    return message

def create_assistant_message(
    session_id: str, 
    user_id: str, 
    content: str,
    model_name: str,
    input_tokens: int,
    output_tokens: int,
    response_time_ms: int,
    reason: Optional[str] = None,
    artifacts: Optional[List[Artifact]] = None
) -> MessageDB:
    message = MessageDB(
        session_id=session_id,
        user_id=user_id,
        content=content,
        role=Role.ASSISTANT,
        model_name=model_name,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        response_time_ms=response_time_ms,
        reason=reason,
        artifacts=artifacts
    )
    messages_table.put_item(Item=message.model_dump())
    return message
