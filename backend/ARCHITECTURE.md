# ARCHITECTURE

## Current Structure Assessment

### ✅ Good Practices
- **Clean separation**: `endpoint.py` (routes) → `services.py` (business logic) → `database.py` (data access)
- **Pydantic models**: Proper request/response validation in `interface.py`
- **Modular routers**: Each domain (auth, projects, etc.) has its own module
- **Core utilities**: Shared logic in `core/` (auth, config, AWS)
- **Type hints**: Good use of Python typing

### ⚠️ Areas for Improvement
- Package naming: Consider `app/` instead of `package/`
- Missing tests structure
- Environment management (.env.example, .env.local, .env.prod)
- Database models separation

## Future-Proof Architecture with Dependency Injection

### Database Abstraction Pattern

```python
# app/repositories/base.py
from abc import ABC, abstractmethod

class UserRepository(ABC):
    @abstractmethod
    def create_user(self, email: str, password_hash: str): pass
    
    @abstractmethod
    def get_user_by_email(self, email: str): pass

class ProjectRepository(ABC):
    @abstractmethod
    def create_project(self, user_id: str, name: str, description: str): pass
    
    @abstractmethod
    def get_projects_by_user(self, user_id: str): pass

# app/repositories/dynamodb.py
class DynamoDBUserRepository(UserRepository):
    def create_user(self, email: str, password_hash: str):
        # DynamoDB implementation
        pass

# app/repositories/duckdb.py  
class DuckDBUserRepository(UserRepository):
    def create_user(self, email: str, password_hash: str):
        # DuckDB implementation
        pass

# app/dependencies.py
def get_user_repo() -> UserRepository:
    if settings.DATABASE_TYPE == "dynamodb":
        return DynamoDBUserRepository()
    elif settings.DATABASE_TYPE == "duckdb":
        return DuckDBUserRepository()

# app/routers/auth/services.py
def register_user(user_data: UserRegister, repo: UserRepository = Depends(get_user_repo)):
    return repo.create_user(user_data.email, password_hash)
```

### Storage Abstraction Pattern

```python
# app/storage/base.py
from abc import ABC, abstractmethod

class FileStorage(ABC):
    @abstractmethod
    def upload_file(self, key: str, content: bytes): pass
    
    @abstractmethod
    def download_file(self, key: str): pass
    
    @abstractmethod
    def delete_file(self, key: str): pass
    
    @abstractmethod
    def generate_presigned_url(self, key: str): pass

# app/storage/s3.py
class S3Storage(FileStorage):
    def upload_file(self, key: str, content: bytes):
        # S3 implementation
        pass

# app/storage/local.py
class LocalStorage(FileStorage):
    def upload_file(self, key: str, content: bytes):
        # Local filesystem implementation
        pass

# app/dependencies.py
def get_file_storage() -> FileStorage:
    if settings.STORAGE_TYPE == "s3":
        return S3Storage()
    elif settings.STORAGE_TYPE == "local":
        return LocalStorage()
```

## Benefits of This Architecture

### 1. **Stack Flexibility**
- Switch `DynamoDB → DuckDB` with config change
- Switch `S3 → Local folders` with config change  
- Same business logic, different infrastructure

### 2. **Environment-Specific Backends**
```python
# Production: DynamoDB + S3
# Development: DuckDB + Local files
# Testing: In-memory + Mock storage
```

### 3. **Easy A/B Testing**
- Test performance between different storage backends
- Gradual migration strategies
- Rollback capabilities

### 4. **Testability**
```python
def test_register_user():
    mock_repo = Mock(spec=UserRepository)
    result = register_user(user_data, repo=mock_repo)
    mock_repo.create_user.assert_called_once()
```

## Implementation Priority

**Phase 1**: Current structure is fine for MVP
**Phase 2**: Implement repository pattern when considering alternative databases
**Phase 3**: Add storage abstraction when considering local development setup

## JupyterLab Development Workflow

### Local Development Setup

```python
# backend/.env.local
DATABASE_TYPE=duckdb
STORAGE_TYPE=local
DUCKDB_PATH=./data/dev.db
LOCAL_STORAGE_PATH=./uploads
AWS_REGION=us-east-1
```

### Jupyter-Friendly Development

```python
# backend/dev_setup.py
import os
from pathlib import Path

def setup_local_dev():
    """Setup local development environment"""
    os.environ['DATABASE_TYPE'] = 'duckdb'
    os.environ['STORAGE_TYPE'] = 'local'
    
    # Create directories
    Path('./data').mkdir(exist_ok=True)
    Path('./uploads').mkdir(exist_ok=True)
    
    return get_repositories()

def get_repositories():
    """Get repositories for jupyter development"""
    from package.repositories.duckdb import DuckDBUserRepository
    from package.storage.local import LocalStorage
    
    return {
        'user_repo': DuckDBUserRepository(),
        'file_storage': LocalStorage(),
    }

# In Jupyter cell:
repos = setup_local_dev()
user_repo = repos['user_repo']

# Test your logic
user = user_repo.create_user("test@example.com", "hash123")
```

### Development Pattern

```python
# Jupyter cell 1: Setup
%load_ext autoreload
%autoreload 2

from dev_setup import setup_local_dev
repos = setup_local_dev()

# Jupyter cell 2: Test business logic
def test_user_registration():
    # Your logic here
    return repos['user_repo'].create_user(...)

result = test_user_registration()
```

### Migration to FastAPI

Once tested in Jupyter:
```python
# Copy working logic to package/routers/auth/services.py
def register_user(user_data: UserRegister, repo = Depends(get_user_repo)):
    # Paste your tested logic here
    pass
```

**Workflow**: **DuckDB + local files** for rapid prototyping → **DynamoDB + S3** for production

## Configuration Example

```python
# app/core/config.py
class Settings(BaseSettings):
    DATABASE_TYPE: str = "dynamodb"  # dynamodb, duckdb, sqlite
    STORAGE_TYPE: str = "s3"         # s3, local, memory
    
    # DynamoDB settings
    AWS_REGION: str = "us-east-1"
    USERS_TABLE: str = "users"
    
    # DuckDB settings  
    DUCKDB_PATH: str = "./data/app.db"
    
    # Local storage settings
    LOCAL_STORAGE_PATH: str = "./uploads"
```