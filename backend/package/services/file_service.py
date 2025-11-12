from datetime import datetime, timezone
from fastapi import HTTPException
from typing import List, Optional
from package.core.repositories import FileRepository, ProjectRepository
from package.schemas.file import File, FileStatus, FileSource
from package.core.interface import FieldDetail
from package.routers.files.interface import FileResponse, FileListResponse, FileMetadataResponse, PresignedUrlResponse
from package.core.config import settings
from package.core.data_catalog import DataCatalog
from package.core.aws_config import get_aws_configs
from package.core.interface import FileMetadata
from uuid import uuid4
import boto3

s3_client = boto3.client('s3', region_name=settings.AWS_REGION)
class FileService:
    def __init__(self, file_repo: FileRepository, project_repo: ProjectRepository):
        self.file_repo = file_repo
        self.project_repo = project_repo

    async def create_file_record(self, project_id: str, user_id: str, filename: str, 
                               s3_key: str, size: int, file_id: Optional[str] = None,
                               status: FileStatus = FileStatus.UPLOADING, 
                               source: FileSource = FileSource.USER_UPLOAD) -> FileResponse:
        """Create file record"""
        # Verify project ownership
        project = await self.project_repo.get_by_id_and_user(project_id, user_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        if file_id:
            file = File(file_id=file_id, project_id=project_id, filename=filename, 
                       s3_key=s3_key, size=size, status=status, source=source)
        else:
            file = File(project_id=project_id, filename=filename, s3_key=s3_key, 
                       size=size, status=status, source=source)
        
        created_file = await self.file_repo.create(file)
        
        return FileResponse(
            file_id=created_file.file_id,
            project_id=created_file.project_id,
            filename=created_file.filename,
            size=created_file.size,
            status=created_file.status,
            source=created_file.source,
            selected=False,
            created_at=datetime.fromisoformat(created_file.created_at),
            updated_at=datetime.fromisoformat(created_file.updated_at)
        )
    
    async def get_project_files(self, project_id: str, user_id: str, status: Optional[str] = None) -> FileListResponse:
        """Get all files for a project"""
        # Verify project ownership
        project = await self.project_repo.get_by_id_and_user(project_id, user_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        files = await self.file_repo.get_by_project_id(project_id, status)
        
        file_responses = [
            FileResponse(
                file_id=file.file_id,
                project_id=file.project_id,
                filename=file.filename,
                size=file.size,
                status=file.status,
                source=file.source,
                selected=file.selected,
                created_at=datetime.fromisoformat(file.created_at),
                updated_at=datetime.fromisoformat(file.updated_at)
            )
            for file in files
        ]
        
        return FileListResponse(files=file_responses)
    
    async def get_file(self, file_id: str, user_id: str) -> FileResponse:
        """Get file by ID with ownership check"""
        file = await self.file_repo.get_by_id(file_id)
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Verify project ownership
        project = await self.project_repo.get_by_id_and_user(file.project_id, user_id)
        if not project:
            raise HTTPException(status_code=404, detail="File not found")
        
        return FileMetadataResponse(
            file_id=file.file_id,
            project_id=file.project_id,
            filename=file.filename,
            size=file.size,
            status=file.status,
            source=file.source,
            selected=file.selected,
            name=file.name,
            description=file.description,
            columns=file.columns,
            created_at=datetime.fromisoformat(file.created_at),
            updated_at=datetime.fromisoformat(file.updated_at)
        )
    
    async def update_file_status(self, file_id: str, user_id: str, status: str) -> FileResponse:
        """Update file status"""
        file = await self.file_repo.get_by_id(file_id)
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Verify project ownership
        project = await self.project_repo.get_by_id_and_user(file.project_id, user_id)
        if not project:
            raise HTTPException(status_code=404, detail="File not found")
        
        updated_file = await self.file_repo.update_status(file_id, status)
        
        return FileResponse(
            file_id=updated_file.file_id,
            project_id=updated_file.project_id,
            filename=updated_file.filename,
            size=updated_file.size,
            status=updated_file.status,
            source=updated_file.source,
            selected=updated_file.selected,
            created_at=datetime.fromisoformat(updated_file.created_at),
            updated_at=datetime.fromisoformat(updated_file.updated_at)
        )

    async def update_file_metadata(self, file_id: str, user_id: str, name: str, 
                                 description: str, columns: List[FieldDetail]) -> FileResponse:
        """Update file metadata"""
        file = await self.file_repo.get_by_id(file_id)
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Verify project ownership
        project = await self.project_repo.get_by_id_and_user(file.project_id, user_id)
        if not project:
            raise HTTPException(status_code=404, detail="File not found")
        
        updated_file = await self.file_repo.update_metadata(file_id, name, description, columns)
        
        return FileResponse(
            file_id=updated_file.file_id,
            project_id=updated_file.project_id,
            filename=updated_file.filename,
            size=updated_file.size,
            status=updated_file.status,
            source=updated_file.source,
            selected=updated_file.selected,
            created_at=datetime.fromisoformat(updated_file.created_at),
            updated_at=datetime.fromisoformat(updated_file.updated_at)
        )
    
    async def update_file_selection(self, file_id: str, user_id: str, selected: bool) -> FileResponse:
        """Update file selection status"""
        file = await self.file_repo.get_by_id(file_id)
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Verify project ownership
        project = await self.project_repo.get_by_id_and_user(file.project_id, user_id)
        if not project:
            raise HTTPException(status_code=404, detail="File not found")
        
        updated_file = await self.file_repo.update_selection(file_id, selected)
        
        return FileResponse(
            file_id=updated_file.file_id,
            project_id=updated_file.project_id,
            filename=updated_file.filename,
            size=updated_file.size,
            status=updated_file.status,
            source=updated_file.source,
            selected=updated_file.selected,
            created_at=datetime.fromisoformat(updated_file.created_at),
            updated_at=datetime.fromisoformat(updated_file.updated_at)
        )
    
    async def confirm_file_upload(self, file_id: str, user_id: str, size: int) -> FileResponse:
        """Confirm file upload and update size and status"""
        file = await self.file_repo.get_by_id(file_id)
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Verify project ownership
        project = await self.project_repo.get_by_id_and_user(file.project_id, user_id)
        if not project:
            raise HTTPException(status_code=404, detail="File not found")
        
        updated_file = await self.file_repo.confirm_upload(file_id, size)
        
        # Create metadata after uploading complete
        catalog = DataCatalog(aws_configs=get_aws_configs())
        source = f"s3://{settings.FILE_BUCKET}/{updated_file.s3_key}"
        catalog.register(name="mock", source=source)
        file_df = catalog.query("DESCRIBE mock;")
        
        # Generate metadata from dataframe
        fm = FileMetadata.from_dataframe(
            name=updated_file.name or updated_file.filename.split(".")[0], 
            description=updated_file.description, 
            df=file_df
        )
        
        # Update file with extracted metadata
        final_file = await self.file_repo.update_metadata(file_id, fm.name, fm.description, fm.columns)
        
        return FileResponse(
            file_id=updated_file.file_id,
            project_id=updated_file.project_id,
            filename=updated_file.filename,
            size=updated_file.size,
            status=updated_file.status,
            source=updated_file.source,
            selected=updated_file.selected,
            created_at=datetime.fromisoformat(updated_file.created_at),
            updated_at=datetime.fromisoformat(updated_file.updated_at)
        )
    
    async def get_selected_files(self, project_id: str, user_id: str) -> FileListResponse:
        """Get selected files for a project"""
        # Verify project ownership
        project = await self.project_repo.get_by_id_and_user(project_id, user_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        files = await self.file_repo.get_selected_by_project(project_id)
        
        file_responses = [
            FileResponse(
                file_id=file.file_id,
                project_id=file.project_id,
                filename=file.filename,
                size=file.size,
                status=file.status,
                source=file.source,
                selected=file.selected,
                created_at=datetime.fromisoformat(file.created_at),
                updated_at=datetime.fromisoformat(file.updated_at)
            )
            for file in files
        ]
        
        return FileListResponse(files=file_responses)
    
    async def delete_file(self, file_id: str, user_id: str) -> bool:
        """Delete file"""
        file = await self.file_repo.get_by_id(file_id)
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Verify project ownership
        project = await self.project_repo.get_by_id_and_user(file.project_id, user_id)
        if not project:
            raise HTTPException(status_code=404, detail="File not found")
        
        return await self.file_repo.delete(file_id)

    async def count_by_project_id(self, project_id:str) -> int | None:
        response = await self.file_repo.count_by_project_id(project_id)
        return response

    async def get_presigned_upload_url(self, project_id, user_id, filename):
        file_id = str(uuid4())
        s3_key = f"{user_id}/{project_id}/files/{file_id}_{filename}"        

        try:
            # Generate presigned POST URL
            response = s3_client.generate_presigned_post(
                Bucket=settings.FILE_BUCKET,
                Key=s3_key,
                Fields={"Content-Type": "text/csv"},
                Conditions=[
                    {"Content-Type": "text/csv"},
                    ["content-length-range", 1, 10485760]  # 1 byte to 10MB
                ],
                ExpiresIn=3600  # 1 hour
            )
            
            entity = File(project_id=project_id, filename=filename, s3_key=s3_key, file_id=file_id, size=0)
            _ = await self.file_repo.create(entity)
            return PresignedUrlResponse(
                url=response['url'],
                file_id=file_id,
                fields=response['fields']
            )
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to generate upload URL: {str(e)}")
        
    async def get_presigned_download_url(self, file_id:str, user_id:str)->PresignedUrlResponse:
        file_record:File = await self.file_repo.get_by_id(file_id)
        try:
            # Generate presigned GET URL
            download_url = s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': settings.FILE_BUCKET, 'Key': file_record.s3_key},
                ExpiresIn=3600  # 1 hour
            )
            
            return PresignedUrlResponse(url=download_url, file_id=file_record.file_id)
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to generate download URL: {str(e)}")