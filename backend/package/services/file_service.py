from datetime import datetime, timezone
from fastapi import HTTPException
from typing import List, Optional
from package.core.repositories import FileRepository, ProjectRepository
from package.schemas.file import File, FileStatus, FileSource
from package.core.interface import FieldDetail
from package.routers.files.interface import FileResponse, FileListResponse

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
        
        return FileResponse(
            file_id=file.file_id,
            project_id=file.project_id,
            filename=file.filename,
            size=file.size,
            status=file.status,
            source=file.source,
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
        
        return FileResponse(
            file_id=updated_file.file_id,
            project_id=updated_file.project_id,
            filename=updated_file.filename,
            size=updated_file.size,
            status=updated_file.status,
            source=updated_file.source,
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