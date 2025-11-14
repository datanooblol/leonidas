from abc import ABC, abstractmethod
from typing import List, Optional, TypeVar, Generic, Any
from pydantic import BaseModel

T = TypeVar('T', bound=BaseModel)

class BaseRepository(ABC, Generic[T]):
    @abstractmethod
    async def create(self, entity: T) -> T:
        pass
    
    @abstractmethod
    async def get_by_id(self, id: str) -> Optional[T]:
        pass
    
    @abstractmethod
    async def update(self, id: str, **kwargs) -> Optional[T]:
        pass
    
    @abstractmethod
    async def delete(self, id: str) -> bool:
        pass
    
    # @abstractmethod
    # async def batch_get_by_ids(self, ids: List[str]) -> List[T]:
    #     pass

class UserRepository(BaseRepository[T]):
    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[T]:
        pass

class ProjectRepository(BaseRepository[T]):
    @abstractmethod
    async def get_by_user_id(self, user_id: str) -> List[T]:
        pass
    
    @abstractmethod
    async def get_by_id_and_user(self, project_id: str, user_id: str) -> Optional[T]:
        pass

class SessionRepository(BaseRepository[T]):
    @abstractmethod
    async def get_by_project_id(self, project_id: str) -> List[T]:
        pass
    
    @abstractmethod
    async def refresh_timestamp(self, session_id: str) -> Optional[T]:
        pass

    @abstractmethod
    async def count_by_project_id(self, project_id:str) -> Optional[T]:
        pass
    
class FileRepository(BaseRepository[T]):
    @abstractmethod
    async def get_by_project_id(self, project_id: str, status: Optional[str] = None) -> List[T]:
        pass
    
    @abstractmethod
    async def get_selected_by_project(self, project_id: str) -> List[T]:
        pass
    
    @abstractmethod
    async def update_status(self, file_id: str, status: str) -> Optional[T]:
        pass
    
    @abstractmethod
    async def update_metadata(self, file_id: str, name: str, description: str, columns: List[Any]) -> Optional[T]:
        pass
    
    @abstractmethod
    async def update_selection(self, file_id: str, selected: bool) -> Optional[T]:
        pass
    
    @abstractmethod
    async def confirm_upload(self, file_id: str, size: int) -> Optional[T]:
        pass

    @abstractmethod
    async def count_by_project_id(self, project_id:str) -> Optional[T]:
        pass

class MessageRepository(BaseRepository[T]):
    @abstractmethod
    async def get_by_session_id(self, session_id: str, limit: Optional[int] = None) -> List[T]:
        pass
    
    @abstractmethod
    async def get_recent_by_session_id(self, session_id: str, limit: int = 10) -> List[T]:
        pass
    
    @abstractmethod
    async def create_user_message(self, session_id: str, user_id: str, content: str, model_name:str) -> T:
        pass
    
    @abstractmethod
    async def create_assistant_message(self, session_id: str, user_id: str, content: str, 
                                     model_name: str, input_tokens: int, output_tokens: int, 
                                     response_time_ms: int, reason: Optional[str] = None, 
                                     artifacts: Optional[List[Any]] = None) -> T:
        pass