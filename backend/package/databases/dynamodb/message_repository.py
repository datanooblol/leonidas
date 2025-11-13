import boto3
from typing import List, Optional, Any
from package.core.config import settings
from package.core.repositories import MessageRepository
from package.schemas.message import Message
from package.llms import Role

class DynamoDBMessageRepository(MessageRepository[Message]):
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb', region_name=settings.AWS_REGION)
        self.table = self.dynamodb.Table(settings.MESSAGES_TABLE)
    
    async def create(self, entity: Message) -> Message:
        self.table.put_item(Item=entity.model_dump())
        return entity
    
    async def get_by_id(self, id: str) -> Optional[Message]:
        response = self.table.get_item(Key={'message_id': id})
        item = response.get('Item')
        return Message(**item) if item else None
    
    async def get_by_session_id(self, session_id: str, limit: Optional[int] = None) -> List[Message]:
        query_params = {
            "IndexName": "SessionIndex",
            "KeyConditionExpression": "session_id = :sid",
            "ExpressionAttributeValues": {":sid": session_id},
            "ScanIndexForward": True  # Chronological order (oldest first)
        }

        if limit:
            query_params["Limit"] = limit
        
        response = self.table.query(**query_params)
        return [Message(**item) for item in response.get("Items", [])]
    
    async def get_recent_by_session_id(self, session_id: str, limit: int = 10) -> List[Message]:
        """Get last N messages for AI context (newest first)"""
        query_params = {
            "IndexName": "SessionIndex", 
            "KeyConditionExpression": "session_id = :sid",
            "ExpressionAttributeValues": {":sid": session_id},
            "ScanIndexForward": False,  # Newest first for AI context
            "Limit": limit
        }
        
        response = self.table.query(**query_params)
        return [Message(**item) for item in response.get("Items", [])]
    
    async def create_user_message(self, session_id: str, user_id: str, content: str, model_name:str) -> Message:
        message = Message(
            session_id=session_id,
            user_id=user_id,
            content=content,
            model_name=model_name,
            role=Role.USER
        )
        self.table.put_item(Item=message.model_dump())
        return message
    
    async def create_assistant_message(self, session_id: str, user_id: str, content: str, 
                                     model_name: str, input_tokens: int, output_tokens: int, 
                                     response_time_ms: int, reason: Optional[str] = None, 
                                     artifacts: Optional[List[Any]] = None) -> Message:
        message = Message(
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
        self.table.put_item(Item=message.model_dump())
        return message
    
    async def update(self, id: str, **kwargs) -> Optional[Message]:
        message = await self.get_by_id(id)
        if not message:
            return None
        
        update_expression = "SET "
        expression_values = {}
        
        for key, value in kwargs.items():
            update_expression += f"{key} = :{key}, "
            expression_values[f":{key}"] = value
        
        update_expression = update_expression.rstrip(", ")
        
        self.table.update_item(
            Key={'message_id': id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_values
        )
        
        return await self.get_by_id(id)
    
    async def delete(self, id: str) -> bool:
        message = await self.get_by_id(id)
        if not message:
            return False
        
        self.table.delete_item(Key={'message_id': id})
        return True
    
    async def batch_get_by_ids(self, ids: List[str]) -> List[Message]:
        if not ids:
            return []
        
        response = self.dynamodb.batch_get_item(
            RequestItems={
                settings.MESSAGES_TABLE: {
                    'Keys': [{'message_id': id} for id in ids]
                }
            }
        )
        
        items = response.get('Responses', {}).get(settings.MESSAGES_TABLE, [])
        return [Message(**item) for item in items]