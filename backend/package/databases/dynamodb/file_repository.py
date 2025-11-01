import boto3
from datetime import datetime, timezone
from typing import List, Optional, Any
from package.core.config import settings
from package.core.repositories import FileRepository
from package.schemas.file import File, FileStatus
from package.core.interface import FieldDetail

class DynamoDBFileRepository(FileRepository[File]):
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb', region_name=settings.AWS_REGION)
        self.table = self.dynamodb.Table(settings.FILES_TABLE)
    
    async def create(self, entity: File) -> File:
        self.table.put_item(Item=entity.model_dump())
        return entity
    
    async def get_by_id(self, id: str) -> Optional[File]:
        response = self.table.get_item(Key={'file_id': id})
        item = response.get('Item')
        if item and 'columns' in item and item['columns']:
            item['columns'] = [FieldDetail(**col) for col in item['columns']]
        return File(**item) if item else None
    
    async def get_by_project_id(self, project_id: str, status: Optional[str] = None) -> List[File]:
        if status:
            response = self.table.query(
                IndexName='ProjectIndex',
                KeyConditionExpression='project_id = :project_id',
                FilterExpression='#status = :status',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={':project_id': project_id, ':status': status}
            )
        else:
            response = self.table.query(
                IndexName='ProjectIndex',
                KeyConditionExpression='project_id = :project_id',
                ExpressionAttributeValues={':project_id': project_id}
            )
        
        items = response.get('Items', [])
        for item in items:
            if 'columns' in item and item['columns']:
                item['columns'] = [FieldDetail(**col) for col in item['columns']]
        return [File(**item) for item in items]
    
    async def get_selected_by_project(self, project_id: str) -> List[File]:
        response = self.table.query(
            IndexName='ProjectIndex',
            KeyConditionExpression='project_id = :project_id',
            FilterExpression='selected = :selected',
            ExpressionAttributeValues={
                ':project_id': project_id,
                ':selected': True
            }
        )
        
        items = response.get('Items', [])
        for item in items:
            if 'columns' in item and item['columns']:
                item['columns'] = [FieldDetail(**col) for col in item['columns']]
        return [File(**item) for item in items]
    
    async def update_status(self, file_id: str, status: str) -> Optional[File]:
        file_record = await self.get_by_id(file_id)
        if not file_record:
            return None
        
        updated_at = datetime.now(timezone.utc).isoformat()
        
        self.table.update_item(
            Key={'file_id': file_id},
            UpdateExpression='SET #status = :status, updated_at = :updated_at',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':status': status,
                ':updated_at': updated_at
            }
        )
        
        return await self.get_by_id(file_id)
    
    async def update_metadata(self, file_id: str, name: str, description: str, columns: List[Any]) -> Optional[File]:
        file_record = await self.get_by_id(file_id)
        if not file_record:
            return None
        
        updated_at = datetime.now(timezone.utc).isoformat()
        columns_dict = [column.model_dump() if hasattr(column, 'model_dump') else column for column in columns]
        
        self.table.update_item(
            Key={'file_id': file_id},
            UpdateExpression='SET #name = :name, description = :description, #columns = :columns, updated_at = :updated_at',
            ExpressionAttributeNames={'#name': 'name', '#columns': 'columns'},
            ExpressionAttributeValues={
                ':name': name,
                ':description': description,
                ':columns': columns_dict,
                ':updated_at': updated_at
            }
        )
        
        return await self.get_by_id(file_id)
    
    async def update_selection(self, file_id: str, selected: bool) -> Optional[File]:
        file_record = await self.get_by_id(file_id)
        if not file_record:
            return None
        
        updated_at = datetime.now(timezone.utc).isoformat()
        
        self.table.update_item(
            Key={'file_id': file_id},
            UpdateExpression='SET selected = :selected, updated_at = :updated_at',
            ExpressionAttributeValues={
                ':selected': selected,
                ':updated_at': updated_at
            }
        )
        
        return await self.get_by_id(file_id)
    
    async def confirm_upload(self, file_id: str, size: int) -> Optional[File]:
        file_record = await self.get_by_id(file_id)
        if not file_record:
            return None
        
        updated_at = datetime.now(timezone.utc).isoformat()
        
        self.table.update_item(
            Key={'file_id': file_id},
            UpdateExpression='SET size = :size, #status = :status, updated_at = :updated_at',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':size': size,
                ':status': FileStatus.COMPLETED.value,
                ':updated_at': updated_at
            }
        )
        
        return await self.get_by_id(file_id)
    
    async def update(self, id: str, **kwargs) -> Optional[File]:
        file_record = await self.get_by_id(id)
        if not file_record:
            return None
        
        update_expression = "SET "
        expression_values = {}
        expression_names = {}
        
        for key, value in kwargs.items():
            if key in ['name', 'status', 'columns']:  # Reserved words in DynamoDB
                update_expression += f"#{key} = :{key}, "
                expression_names[f'#{key}'] = key
                expression_values[f":{key}"] = value
            else:
                update_expression += f"{key} = :{key}, "
                expression_values[f":{key}"] = value
        
        update_expression = update_expression.rstrip(", ")
        
        update_params = {
            'Key': {'file_id': id},
            'UpdateExpression': update_expression,
            'ExpressionAttributeValues': expression_values
        }
        
        if expression_names:
            update_params['ExpressionAttributeNames'] = expression_names
        
        self.table.update_item(**update_params)
        return await self.get_by_id(id)
    
    async def delete(self, id: str) -> bool:
        file_record = await self.get_by_id(id)
        if not file_record:
            return False
        
        self.table.delete_item(Key={'file_id': id})
        return True
    
    async def batch_get_by_ids(self, ids: List[str]) -> List[File]:
        if not ids:
            return []
        
        # Filter out invalid file_ids
        valid_file_ids = [id.strip() for id in ids if id and isinstance(id, str) and len(id.strip()) > 0]
        if not valid_file_ids:
            return []
        
        batch_size = 100
        all_files = []
        
        for i in range(0, len(valid_file_ids), batch_size):
            batch_ids = valid_file_ids[i:i + batch_size]
            
            response = self.dynamodb.batch_get_item(
                RequestItems={
                    settings.FILES_TABLE: {
                        'Keys': [{'file_id': file_id} for file_id in batch_ids]
                    }
                }
            )
            
            items = response.get('Responses', {}).get(settings.FILES_TABLE, [])
            
            for item in items:
                if 'columns' in item and item['columns']:
                    item['columns'] = [FieldDetail(**col) for col in item['columns']]
                all_files.append(File(**item))
        
        return all_files