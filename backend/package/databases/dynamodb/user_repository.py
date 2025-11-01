import boto3
from typing import List, Optional
from package.core.config import settings
from package.core.repositories import UserRepository
from package.schemas.user import User

class DynamoDBUserRepository(UserRepository[User]):
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb', region_name=settings.AWS_REGION)
        self.table = self.dynamodb.Table(settings.USERS_TABLE)
    
    async def create(self, entity: User) -> User:
        self.table.put_item(Item=entity.model_dump())
        return entity
    
    async def get_by_id(self, id: str) -> Optional[User]:
        response = self.table.get_item(Key={'user_id': id})
        item = response.get('Item')
        return User(**item) if item else None
    
    async def get_by_email(self, email: str) -> Optional[User]:
        response = self.table.scan(
            FilterExpression='email = :email',
            ExpressionAttributeValues={':email': email}
        )
        items = response.get('Items', [])
        return User(**items[0]) if items else None
    
    async def update(self, id: str, **kwargs) -> Optional[User]:
        # Generic update implementation
        user = await self.get_by_id(id)
        if not user:
            return None
        
        update_expression = "SET "
        expression_values = {}
        
        for key, value in kwargs.items():
            update_expression += f"{key} = :{key}, "
            expression_values[f":{key}"] = value
        
        update_expression = update_expression.rstrip(", ")
        
        self.table.update_item(
            Key={'user_id': id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_values
        )
        
        return await self.get_by_id(id)
    
    async def delete(self, id: str) -> bool:
        user = await self.get_by_id(id)
        if not user:
            return False
        
        self.table.delete_item(Key={'user_id': id})
        return True
    
    # async def batch_get_by_ids(self, ids: List[str]) -> List[User]:
    #     if not ids:
    #         return []
        
    #     response = self.dynamodb.batch_get_item(
    #         RequestItems={
    #             settings.USERS_TABLE: {
    #                 'Keys': [{'user_id': id} for id in ids]
    #             }
    #         }
    #     )
        
    #     items = response.get('Responses', {}).get(settings.USERS_TABLE, [])
    #     return [User(**item) for item in items]