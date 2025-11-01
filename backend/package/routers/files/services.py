import boto3
from fastapi import HTTPException
from datetime import datetime
from uuid import uuid4
from .database import create_file_record, get_project_files, get_file_by_id, delete_file_record, confirm_file_upload_record, update_file_record, update_file_metadata, update_file_selection_db
from .interface import PresignedUrlResponse, FileResponse, FileListResponse
from package.routers.projects.database import get_project_by_id
from package.core.config import settings
from package.core.data_catalog import DataCatalog
from package.core.aws_config import get_aws_configs
from package.core.interface import FileMetadata

s3_client = boto3.client('s3', region_name=settings.AWS_REGION)

def verify_file_ownership(file_id: str, user_id: str):
    """Verify file exists and user owns the project"""
    file_record = get_file_by_id(file_id)
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    
    project = get_project_by_id(file_record.project_id, user_id)
    if not project:
        raise HTTPException(status_code=404, detail="File not found")
    
    return file_record


def generate_presigned_upload_url(project_id: str, user_id: str, filename: str) -> PresignedUrlResponse:
    """Generate presigned URL for file upload"""
    # Verify project ownership
    project = get_project_by_id(project_id, user_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Validate file type (CSV only)
    if not filename.lower().endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    # Generate S3 key and file ID
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
        
        # Create DynamoDB record with uploading status
        create_file_record(
            project_id=project_id,
            filename=filename,
            s3_key=s3_key,
            size=0,  # Will be updated after upload
            file_id=file_id
        )
        
        return PresignedUrlResponse(
            url=response['url'],
            file_id=file_id,
            fields=response['fields']
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate upload URL: {str(e)}")

def generate_presigned_download_url(file_id: str, user_id: str) -> PresignedUrlResponse:
    """Generate presigned URL for file download"""
    file_record = verify_file_ownership(file_id, user_id)
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

def confirm_file_upload(file_id: str, user_id: str, size: int) -> FileResponse:
    """Confirm file upload and update record"""
    file_record = verify_file_ownership(file_id, user_id)

    # Create metadata after uploading complete
    catalog = DataCatalog(aws_configs=get_aws_configs())
    source = f"s3://{settings.FILE_BUCKET}/{file_record.s3_key}"
    catalog.register(name="mock", source=source)
    file = catalog.query(f"DESCRIBE mock;")
    print(file)
    fm = FileMetadata.from_dataframe(name=file_record.name, description=file_record.description, df=file)
    # Update file record with actual size
    updated_record = confirm_file_upload_record(file_id, size)
    updated_record = update_file_metadata(file_id, fm.name, fm.description, fm.columns)
    
    return FileResponse(
        file_id=updated_record.file_id,
        project_id=updated_record.project_id,
        filename=updated_record.filename,
        size=updated_record.size,
        status=updated_record.status,
        source=updated_record.source,
        created_at=datetime.fromisoformat(updated_record.created_at),
        updated_at=datetime.fromisoformat(updated_record.updated_at)
    )

def rename_file(file_id: str, user_id: str, new_filename: str) -> FileResponse:
    """Rename file"""
    file_record = verify_file_ownership(file_id, user_id)
    # Validate file type (CSV only)
    if not new_filename.lower().endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    # Update filename in database
    updated_record = update_file_record(file_id, new_filename)
    
    return FileResponse(
        file_id=updated_record.file_id,
        project_id=updated_record.project_id,
        filename=updated_record.filename,
        size=updated_record.size,
        status=updated_record.status,
        source=updated_record.source,
        created_at=datetime.fromisoformat(updated_record.created_at),
        updated_at=datetime.fromisoformat(updated_record.updated_at)
    )

def get_files_for_project(project_id: str, user_id: str) -> FileListResponse:
    """Get all files for project"""
    # Verify project ownership
    project = get_project_by_id(project_id, user_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    files = get_project_files(project_id)
    
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

def delete_user_file(file_id: str, user_id: str) -> dict:
    """Delete file from S3 and database"""
    file_record = verify_file_ownership(file_id, user_id)
    try:
        # Delete from S3
        s3_client.delete_object(
            Bucket=settings.FILE_BUCKET,
            Key=file_record.s3_key
        )
        
        # Delete database record
        success = delete_file_record(file_id)
        if not success:
            raise HTTPException(status_code=404, detail="File not found")
        
        return {"message": "File deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File deletion failed: {str(e)}")

def update_file_metadata_service(file_id: str, user_id: str, metadata: FileMetadata) -> FileResponse:
    """Update file metadata"""
    file_record = verify_file_ownership(file_id, user_id)
    
    # Update metadata
    updated_file = update_file_metadata(file_id, metadata.name, metadata.description, metadata.columns)
    if not updated_file:
        raise HTTPException(status_code=500, detail="Failed to update metadata")
    
    return FileResponse(**updated_file.model_dump())

def get_file_metadata_service(file_id: str, user_id: str) -> FileMetadata:
    """Get file metadata"""
    file_record = verify_file_ownership(file_id, user_id)
    return FileMetadata(
        file_id=file_record.file_id,
        name=file_record.name,
        description=file_record.description,
        columns=file_record.columns
    )

def update_file_selection_service(file_id: str, user_id: str, selected: bool) -> FileResponse:
    """Update file selection status"""
    file_record = verify_file_ownership(file_id, user_id)
    # Update selection status
    updated_record = update_file_selection_db(file_id, selected)
    if not updated_record:
        raise HTTPException(status_code=500, detail="Failed to update selection")
    
    return FileResponse(
        file_id=updated_record.file_id,
        project_id=updated_record.project_id,
        filename=updated_record.filename,
        size=updated_record.size,
        status=updated_record.status,
        source=updated_record.source,
        created_at=datetime.fromisoformat(updated_record.created_at),
        updated_at=datetime.fromisoformat(updated_record.updated_at)
    )


