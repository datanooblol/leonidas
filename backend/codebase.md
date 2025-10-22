# Backend Codebase Structure

## Design Philosophy

This backend follows a **domain-driven microservice architecture** where each feature domain is completely self-contained. This approach enables easy development, maintenance, and future scaling to separate microservices.

## Project Structure

```
backend/
├── main.py                           # FastAPI app setup + router registration
├── package/
│   ├── __init__.py                  # Package initialization
│   ├── core/                        # Shared utilities only
│   │   ├── __init__.py              # Core package initialization
│   │   ├── config.py                # Environment variables
│   │   └── auth_middleware.py       # JWT validation middleware
│   └── routers/
│       ├── auth/
│       │   ├── __init__.py          # Auth package initialization
│       │   ├── endpoint.py          # Authentication routes (/auth/*)
│       │   ├── services.py          # Auth business logic
│       │   ├── interface.py         # Auth Pydantic models
│       │   └── database.py          # Users table operations
│       ├── projects/
│       │   ├── __init__.py          # Projects package initialization
│       │   ├── endpoint.py          # Project routes (/projects/*)
│       │   ├── services.py          # Project business logic
│       │   ├── interface.py         # Project Pydantic models
│       │   └── database.py          # Projects table operations
│       ├── sessions/
│       │   ├── __init__.py          # Sessions package initialization
│       │   ├── endpoint.py          # Session routes (/sessions/*)
│       │   ├── services.py          # Session business logic
│       │   ├── interface.py         # Session Pydantic models
│       │   └── database.py          # Sessions table operations
│       ├── files/
│       │   ├── __init__.py          # Files package initialization
│       │   ├── endpoint.py          # File routes (/files/*)
│       │   ├── services.py          # S3 upload/download logic
│       │   ├── interface.py         # File Pydantic models
│       │   └── database.py          # Files table operations
│       └── chat/
│           ├── __init__.py          # Chat package initialization
│           ├── endpoint.py          # Chat routes (/sessions/*/messages)
│           ├── services.py          # Bedrock AI integration
│           ├── interface.py         # Chat Pydantic models
│           └── database.py          # Messages table operations
```

## File Responsibilities

### Per Domain Structure
Each domain folder contains exactly 4 files:

- **`endpoint.py`** - FastAPI router with HTTP endpoints
- **`services.py`** - Business logic and external service integrations
- **`interface.py`** - Pydantic models for request/response validation
- **`database.py`** - DynamoDB operations and data access

### Core Utilities
- **`main.py`** - Application setup and router registration
- **`package/core/config.py`** - Environment variables and configuration
- **`package/core/auth_middleware.py`** - JWT token validation

## Development Benefits

### Easy Development
- **Small files** - Each file has single responsibility (~50-100 lines)
- **Clear patterns** - Every domain follows identical structure
- **No confusion** - Always know where to find/add code
- **Fast navigation** - Everything for one feature in one folder

### Easy Maintenance
- **Bug isolation** - Issues are contained within single domain
- **Feature additions** - New functionality goes to relevant domain
- **Independent testing** - Test each domain in isolation
- **Focused code reviews** - Changes are localized and easy to review

### Easy Scaling
- **Team collaboration** - Different developers can own different domains
- **Performance optimization** - Optimize specific domains independently
- **Microservice extraction** - Copy domain folder to create separate service
- **Zero dependencies** - Domains don't depend on each other

## Development Workflow

1. **Choose domain** (e.g., projects)
2. **Define API models** in `interface.py`
3. **Build database layer** in `database.py`
4. **Implement business logic** in `services.py`
5. **Create HTTP endpoints** in `endpoint.py`
6. **Register router** in `main.py`

## Example Implementation Flow

```python
# 1. Define models (interface.py)
class ProjectCreate(BaseModel):
    name: str
    description: str

# 2. Database operations (database.py)
def create_project(user_id: str, project_data: ProjectCreate):
    # DynamoDB put_item logic

# 3. Business logic (services.py)
def create_user_project(user_id: str, project_data: ProjectCreate):
    # Validation + call database layer

# 4. HTTP endpoint (endpoint.py)
@router.post("/projects")
def create_project_endpoint(project: ProjectCreate, user_id: str = Depends(get_current_user)):
    # Call service layer
```

## Future Scalability

This structure enables seamless evolution:
- **MVP**: Single Lambda with all domains
- **Growth**: Extract high-traffic domains to separate Lambdas
- **Scale**: Convert domains to independent microservices
- **Enterprise**: Each domain becomes separate team ownership

The modular design ensures no major refactoring is needed at any scale.