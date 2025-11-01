import boto3
from datetime import datetime, timezone
from typing import List, Optional
from package.core.config import settings
from package.core.repositories import SessionRepository
from package.schemas.session import Session

class DynamoDBSessionRepository(SessionRepository[Session]):
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb', region_name=settings.AWS_REGION)
        self.table = self.dynamodb.Table(settings.SESSIONS_TABLE)
    
    async def create(self, entity: Session) -> Session:
        self.table.put_item(Item=entity.model_dump())
        return entity
    
    async def get_by_id(self, id: str) -> Optional[Session]:
        response = self.table.get_item(Key={'session_id': id})
        item = response.get('Item')
        return Session(**item) if item else None
    
    async def get_by_project_id(self, project_id: str) -> List[Session]:
        response = self.table.query(
            IndexName='ProjectIndex',
            KeyConditionExpression='project_id = :project_id',
            ExpressionAttributeValues={':project_id': project_id}
        )
        return [Session(**item) for item in response.get('Items', [])]
    
    async def refresh_timestamp(self, session_id: str) -> Optional[Session]:
        session = await self.get_by_id(session_id)
        if not session:
            return None
        
        updated_at = datetime.now(timezone.utc).isoformat()
        
        self.table.update_item(
            Key={'session_id': session_id},
            UpdateExpression='SET updated_at = :updated_at',
            ExpressionAttributeValues={':updated_at': updated_at}
        )
        
        return await self.get_by_id(session_id)
    
    async def update(self, id: str, **kwargs) -> Optional[Session]:
        session = await self.get_by_id(id)
        if not session:
            return None
        
        update_expression = "SET "
        expression_values = {}
        expression_names = {}
        
        for key, value in kwargs.items():
            if key == 'name':  # 'name' is a reserved word in DynamoDB
                update_expression += f"#name = :name, "
                expression_names['#name'] = 'name'
                expression_values[':name'] = value
            else:
                update_expression += f"{key} = :{key}, "
                expression_values[f":{key}"] = value
        
        update_expression = update_expression.rstrip(", ")
        
        update_params = {
            'Key': {'session_id': id},
            'UpdateExpression': update_expression,
            'ExpressionAttributeValues': expression_values
        }
        
        if expression_names:
            update_params['ExpressionAttributeNames'] = expression_names
        
        self.table.update_item(**update_params)
        return await self.get_by_id(id)
    
    async def delete(self, id: str) -> bool:
        session = await self.get_by_id(id)
        if not session:
            return False
        
        self.table.delete_item(Key={'session_id': id})
        return True
    
    async def batch_get_by_ids(self, ids: List[str]) -> List[Session]:
        if not ids:
            return []
        
        response = self.dynamodb.batch_get_item(
            RequestItems={
                settings.SESSIONS_TABLE: {
                    'Keys': [{'session_id': id} for id in ids]
                }
            }
        )
        
        items = response.get('Responses', {}).get(settings.SESSIONS_TABLE, [])
        return [Session(**item) for item in items]