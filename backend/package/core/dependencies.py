from functools import lru_cache
from package.core.config import settings
from package.core.repositories import UserRepository, ProjectRepository, SessionRepository, FileRepository, MessageRepository
from package.databases.dynamodb.user_repository import DynamoDBUserRepository
from package.databases.dynamodb.project_repository import DynamoDBProjectRepository
from package.databases.dynamodb.session_repository import DynamoDBSessionRepository
from package.databases.dynamodb.file_repository import DynamoDBFileRepository
from package.databases.dynamodb.message_repository import DynamoDBMessageRepository

@lru_cache()
def get_user_repository() -> UserRepository:
    if settings.DATABASE_TYPE == "dynamodb":
        return DynamoDBUserRepository()
    else:
        raise ValueError(f"Unsupported database: {settings.DATABASE_TYPE}")

@lru_cache()
def get_project_repository() -> ProjectRepository:
    if settings.DATABASE_TYPE == "dynamodb":
        return DynamoDBProjectRepository()
    else:
        raise ValueError(f"Unsupported database: {settings.DATABASE_TYPE}")

@lru_cache()
def get_session_repository() -> SessionRepository:
    if settings.DATABASE_TYPE == "dynamodb":
        return DynamoDBSessionRepository()
    else:
        raise ValueError(f"Unsupported database: {settings.DATABASE_TYPE}")

@lru_cache()
def get_file_repository() -> FileRepository:
    if settings.DATABASE_TYPE == "dynamodb":
        return DynamoDBFileRepository()
    else:
        raise ValueError(f"Unsupported database: {settings.DATABASE_TYPE}")

@lru_cache()
def get_message_repository() -> MessageRepository:
    if settings.DATABASE_TYPE == "dynamodb":
        return DynamoDBMessageRepository()
    else:
        raise ValueError(f"Unsupported database: {settings.DATABASE_TYPE}")

# Services
from package.services.auth_service import AuthService

@lru_cache()
def get_auth_service() -> AuthService:
    return AuthService(get_user_repository())

from package.services.project_service import ProjectService

@lru_cache()
def get_project_service() -> ProjectService:
    return ProjectService(get_project_repository())

from package.services.session_service import SessionService

@lru_cache()
def get_session_service() -> SessionService:
    return SessionService(get_session_repository(), get_project_repository())

from package.services.file_service import FileService

@lru_cache()
def get_file_service() -> FileService:
    return FileService(get_file_repository(), get_project_repository())

from package.services.chat_service import ChatService

@lru_cache()
def get_chat_service() -> ChatService:
    return ChatService(
        get_message_repository(),
        get_session_repository(), 
        get_project_repository(),
        get_file_repository()
    )