# import boto3
# from datetime import datetime, timezone
# from uuid import uuid4
# from typing import List, Optional
# from package.core.config import settings
# from pydantic import BaseModel, Field

# dynamodb = boto3.resource('dynamodb', region_name=settings.AWS_REGION)
# projects_table = dynamodb.Table(settings.PROJECTS_TABLE)

# class ProjectDB(BaseModel):
#     project_id: str = Field(default_factory=lambda: str(uuid4()))
#     user_id: str
#     name: str
#     description: str
#     created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
#     updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# def create_project(user_id: str, name: str, description: str) -> ProjectDB:
#     """Create new project in DynamoDB"""
#     project = ProjectDB(user_id=user_id, name=name, description=description)
#     projects_table.put_item(Item=project.model_dump())
#     return project

# def get_user_projects(user_id: str) -> List[ProjectDB]:
#     """Get all projects for a user"""
#     response = projects_table.query(
#         IndexName='UserIndex',
#         KeyConditionExpression='user_id = :user_id',
#         ExpressionAttributeValues={':user_id': user_id}
#     )
#     return [ProjectDB(**item) for item in response.get('Items', [])]

# def get_project_by_id(project_id: str, user_id: str) -> Optional[ProjectDB]:
#     """Get project by ID (with user ownership check)"""
#     response = projects_table.get_item(Key={'project_id': project_id})
#     project = response.get('Item')
    
#     if project and project['user_id'] == user_id:
#         return ProjectDB(**project)
#     return None

# def update_project(project_id: str, user_id: str, name: str, description: str) -> Optional[ProjectDB]:
#     """Update project"""
#     project = get_project_by_id(project_id, user_id)
#     if not project:
#         return None
    
#     updated_at = datetime.now(timezone.utc).isoformat()
    
#     projects_table.update_item(
#         Key={'project_id': project_id},
#         UpdateExpression='SET #name = :name, description = :description, updated_at = :updated_at',
#         ExpressionAttributeNames={'#name': 'name'},
#         ExpressionAttributeValues={
#             ':name': name,
#             ':description': description,
#             ':updated_at': updated_at
#         }
#     )
    
#     # Return updated project
#     project.name = name
#     project.description = description
#     project.updated_at = updated_at
#     return project

# def delete_project(project_id: str, user_id: str) -> bool:
#     """Delete project"""
#     project = get_project_by_id(project_id, user_id)
#     if not project:
#         return False
    
#     projects_table.delete_item(Key={'project_id': project_id})
#     return True