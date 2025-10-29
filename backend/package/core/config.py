import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv(override=True)

class Settings:
    # JWT Configuration
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    
    # AWS Configuration
    AWS_REGION: str = os.getenv("APP_AWS_REGION", "ap-southeast-1")
    
    # DynamoDB Configuration
    DYNAMODB_TABLE_PREFIX: str = os.getenv("DYNAMODB_TABLE_PREFIX", "leonidas_dev_")
    USERS_TABLE: str = f"{DYNAMODB_TABLE_PREFIX}users"
    PROJECTS_TABLE: str = f"{DYNAMODB_TABLE_PREFIX}projects"
    SESSIONS_TABLE: str = f"{DYNAMODB_TABLE_PREFIX}sessions"
    FILES_TABLE: str = f"{DYNAMODB_TABLE_PREFIX}files"
    MESSAGES_TABLE: str = f"{DYNAMODB_TABLE_PREFIX}messages"
    
    # S3 Configuration
    S3_BUCKET: str = os.getenv("S3_BUCKET", "leonidas-dev-bucket")
    FILE_BUCKET: str = os.getenv("FILE_BUCKET", "leonidas-dev-uploads-9586b382")
    
    # Bedrock Configuration
    BEDROCK_MODEL_ID: str = os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-sonnet-20240229-v1:0")

settings = Settings()