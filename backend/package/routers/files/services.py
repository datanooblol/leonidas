# import boto3
# from fastapi import HTTPException
# from datetime import datetime
# from uuid import uuid4
# from .database import create_file_record, get_project_files, get_file_by_id, delete_file_record, confirm_file_upload_record, update_file_record, update_file_metadata, update_file_selection_db
# from .interface import PresignedUrlResponse, FileResponse, FileListResponse
# from package.routers.projects.database import get_project_by_id
# from package.core.config import settings
# from package.core.data_catalog import DataCatalog
# from package.core.aws_config import get_aws_configs
# from package.core.interface import FileMetadata

# s3_client = boto3.client('s3', region_name=settings.AWS_REGION)

# def verify_file_ownership(file_id: str, user_id: str):
#     """Verify file exists and user owns the project"""
#     file_record = get_file_by_id(file_id)
#     if not file_record:
#         raise HTTPException(status_code=404, detail="File not found")
    
#     project = get_project_by_id(file_record.project_id, user_id)
#     if not project:
#         raise HTTPException(status_code=404, detail="File not found")
    
#     return file_record


# def generate_presigned_upload_url(project_id: str, user_id: str, filename: str) -> PresignedUrlResponse:
#     """Generate presigned URL for file upload"""
#     # Verify project ownership
#     project = get_project_by_id(project_id, user_id)
#     if not project:
#         raise HTTPException(status_code=404, detail="Project not found")
    
#     # Validate file type (CSV only)
#     if not filename.lower().endswith('.csv'):
#         raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
#     # Generate S3 key and file ID
#     file_id = str(uuid4())
#     s3_key = f"{user_id}/{project_id}/files/{file_id}_{filename}"
    
#     try:
#         # Generate presigned POST URL
#         response = s3_client.generate_presigned_post(
#             Bucket=settings.FILE_BUCKET,
#             Key=s3_key,
#             Fields={"Content-Type": "text/csv"},
#             Conditions=[
#                 {"Content-Type": "text/csv"},
#                 ["content-length-range", 1, 10485760]  # 1 byte to 10MB
#             ],
#             ExpiresIn=3600  # 1 hour
#         )
        
#         # Create DynamoDB record with uploading status
#         create_file_record(
#             project_id=project_id,
#             filename=filename,
#             s3_key=s3_key,
#             size=0,  # Will be updated after upload
#             file_id=file_id
#         )
        
#         return PresignedUrlResponse(
#             url=response['url'],
#             file_id=file_id,
#             fields=response['fields']
#         )
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to generate upload URL: {str(e)}")

# def generate_presigned_download_url(file_id: str, user_id: str) -> PresignedUrlResponse:
#     """Generate presigned URL for file download"""
#     file_record = verify_file_ownership(file_id, user_id)
#     try:
#         # Generate presigned GET URL
#         download_url = s3_client.generate_presigned_url(
#             'get_object',
#             Params={'Bucket': settings.FILE_BUCKET, 'Key': file_record.s3_key},
#             ExpiresIn=3600  # 1 hour
#         )
        
#         return PresignedUrlResponse(url=download_url, file_id=file_record.file_id)
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to generate download URL: {str(e)}")
