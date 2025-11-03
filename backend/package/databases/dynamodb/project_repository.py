import boto3
from typing import List, Optional
from package.core.config import settings
from package.core.repositories import ProjectRepository
from package.schemas.project import Project

class DynamoDBProjectRepository(ProjectRepository[Project]):
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb', region_name=settings.AWS_REGION)
        self.table = self.dynamodb.Table(settings.PROJECTS_TABLE)
    
    async def create(self, entity: Project) -> Project:
        self.table.put_item(Item=entity.model_dump())
        return entity
    
    async def get_by_id(self, id: str) -> Optional[Project]:
        response = self.table.get_item(Key={'project_id': id})
        item = response.get('Item')
        return Project(**item) if item else None
    
    async def get_by_user_id(self, user_id: str) -> List[Project]:
        response = self.table.query(
            IndexName='UserIndex',
            KeyConditionExpression='user_id = :user_id',
            ExpressionAttributeValues={':user_id': user_id}
        )
        return [Project(**item) for item in response.get('Items', [])]
    
    async def get_by_id_and_user(self, project_id: str, user_id: str) -> Optional[Project]:
        response = self.table.get_item(Key={'project_id': project_id})
        project = response.get('Item')
        
        if project and project['user_id'] == user_id:
            return Project(**project)
        return None
    
    async def update(self, id: str, **kwargs) -> Optional[Project]:
        project = await self.get_by_id(id)
        if not project:
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
            'Key': {'project_id': id},
            'UpdateExpression': update_expression,
            'ExpressionAttributeValues': expression_values
        }
        
        if expression_names:
            update_params['ExpressionAttributeNames'] = expression_names
        
        self.table.update_item(**update_params)
        return await self.get_by_id(id)
    
    async def delete(self, id: str) -> bool:
        project = await self.get_by_id(id)
        if not project:
            return False
        
        self.table.delete_item(Key={'project_id': id})
        return True
    
    # async def batch_get_by_ids(self, ids: List[str]) -> List[Project]:
    #     if not ids:
    #         return []
        
    #     response = self.dynamodb.batch_get_item(
    #         RequestItems={
    #             settings.PROJECTS_TABLE: {
    #                 'Keys': [{'project_id': id} for id in ids]
    #             }
    #         }
    #     )
        
    #     items = response.get('Responses', {}).get(settings.PROJECTS_TABLE, [])
    #     return [Project(**item) for item in items]