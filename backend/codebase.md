# Leonidas Backend - AI Data Scientist Platform

## Design Philosophy

This backend follows a **minimal domain-driven architecture** with complete type safety. Each feature domain is self-contained with Pydantic schemas for all data operations, enabling easy development, maintenance, and future scaling.

## Project Structure

```
backend/
├── main.py                           # FastAPI app setup + router registration
├── package/
│   ├── __init__.py                  # Package initialization
│   ├── core/                        # Shared utilities
│   │   ├── __init__.py              # Core package initialization
│   │   ├── config.py                # Environment variables
│   │   ├── auth_middleware.py       # JWT validation middleware
│   │   └── llm.py                   # AWS Bedrock integration + Role enum
│   └── routers/
│       ├── auth/                    # User authentication
│       │   ├── endpoint.py          # /register, /login
│       │   ├── services.py          # bcrypt hashing, JWT tokens
│       │   ├── interface.py         # UserRegister, UserLogin, AuthResponse
│       │   └── database.py          # UserDB schema + users table ops
│       ├── projects/                # Project management
│       │   ├── endpoint.py          # CRUD + nested sessions/files
│       │   ├── services.py          # Project business logic
│       │   ├── interface.py         # ProjectCreate, ProjectResponse
│       │   └── database.py          # ProjectDB schema + projects table
│       ├── sessions/                # Chat sessions
│       │   ├── endpoint.py          # Session CRUD + refresh
│       │   ├── services.py          # Session management
│       │   ├── interface.py         # SessionCreate, SessionResponse
│       │   └── database.py          # SessionDB schema + sessions table
│       ├── files/                   # File management
│       │   ├── endpoint.py          # Download, confirm, rename, delete
│       │   ├── services.py          # S3 presigned URLs + metadata
│       │   ├── interface.py         # FileResponse + PresignedUrlResponse
│       │   └── database.py          # FileDB + FileStatus/FileSource enums
│       └── chat/                    # AI chatbot "DS Bro"
│           ├── endpoint.py          # POST/GET /sessions/{id}/chat
│           ├── services.py          # DS Bro personality + conversation
│           ├── interface.py         # MessageSend, ChatResponse
│           └── database.py          # MessageDB schema + messages table
```

## Architecture Layers

### Per Domain Structure (4 files each)
- **`database.py`** - Pydantic schemas + type-safe DynamoDB operations
- **`services.py`** - Business logic + external service integrations  
- **`interface.py`** - API request/response models
- **`endpoint.py`** - FastAPI routes + HTTP handling

### Core Utilities
- **`main.py`** - FastAPI app + CORS + router registration
- **`core/config.py`** - Environment variables (AWS, JWT, S3)
- **`core/auth_middleware.py`** - JWT token validation + user extraction
- **`core/llm.py`** - AWS Bedrock integration + Role enum + ModelResponse

## Key Features Implemented

### Authentication System
- JWT-based auth with bcrypt password hashing
- User registration and login endpoints
- Middleware for protected routes

### Project Management
- CRUD operations for data science projects
- User ownership validation
- Nested resources (sessions, files)

### Chat System - "DS Bro" AI Assistant
- AWS Bedrock integration with OpenAI models
- Friendly data scientist personality
- Conversation history with chronological ordering
- Message CRUD operations

### File Management
- S3 presigned URL upload/download flow
- File status tracking (uploading, completed, processing, failed)
- File source tracking (user_upload, app_generated)
- CSV file validation and metadata storage

### Session Management
- Chat session organization within projects
- Session refresh/restart functionality
- Project-scoped session listing

## Type Safety & Data Flow

### Database Schemas (Pydantic)
- **UserDB** - User accounts with email validation
- **ProjectDB** - Projects with auto-timestamps
- **SessionDB** - Chat sessions linked to projects
- **MessageDB** - Chat messages with Role enum (USER/ASSISTANT)
- **FileDB** - File metadata with FileStatus/FileSource enums

### Enums for Type Safety
- **Role** - USER, ASSISTANT (for chat messages)
- **FileStatus** - UPLOADING, COMPLETED, PROCESSING, FAILED
- **FileSource** - USER_UPLOAD, APP_GENERATED

### DynamoDB Design
- **Efficient GSI usage** - UserIndex, ProjectIndex, SessionIndex
- **Chronological ordering** - created_at sort keys for chat history
- **Pay-per-request billing** - Cost-effective scaling
- **User ownership validation** - Security through data isolation

## Development Benefits

### Minimal & Clean
- **Type-safe operations** - Pydantic validation everywhere
- **Consistent patterns** - Same 4-file structure across domains
- **No bloat** - Only essential code, no unnecessary abstractions
- **Clear separation** - Database → Services → Interface → Endpoints

### Production Ready
- **Error handling** - Proper HTTP exceptions and validation
- **Security** - JWT auth + user ownership checks
- **Scalability** - Efficient DynamoDB queries with GSI
- **Maintainability** - Self-documenting code with type hints

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Projects
- `GET /projects` - List user projects
- `POST /projects` - Create project
- `GET /projects/{id}` - Get project details
- `PUT /projects/{id}` - Update project
- `DELETE /projects/{id}` - Delete project

### Sessions (nested under projects)
- `GET /projects/{id}/sessions` - List project sessions
- `POST /projects/{id}/sessions` - Create session
- `GET /sessions/{id}` - Get session details
- `PUT /sessions/{id}` - Update session
- `POST /sessions/{id}/refresh` - Refresh session
- `DELETE /sessions/{id}` - Delete session

### Chat (DS Bro AI)
- `POST /sessions/{id}/chat` - Send message to DS Bro
- `GET /sessions/{id}/chat` - Get chat history

### Files
- `POST /projects/{id}/files/upload-url` - Get upload URL
- `GET /projects/{id}/files` - List project files
- `POST /files/{id}/confirm` - Confirm upload
- `GET /files/{id}/download-url` - Get download URL
- `PUT /files/{id}/rename` - Rename file
- `DELETE /files/{id}` - Delete file

## Example Type-Safe Flow

```python
# 1. Database schema (database.py)
class MessageDB(BaseModel):
    message_id: str = Field(default_factory=lambda: str(uuid4()))
    session_id: str
    content: str
    role: Role  # Enum: USER or ASSISTANT
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# 2. Database operation (database.py)
def create_user_message(session_id: str, user_id: str, content: str) -> MessageDB:
    message = MessageDB(session_id=session_id, user_id=user_id, content=content, role=Role.USER)
    messages_table.put_item(Item=message.model_dump())
    return message

# 3. Business logic (services.py)
def send_message_to_session(user_id: str, session_id: str, message_data: MessageSend) -> ChatResponse:
    validate_session(user_id, session_id)
    user_msg = create_user_message(session_id, user_id, message_data.content)
    # AI processing...
    return ChatResponse(...)

# 4. HTTP endpoint (endpoint.py)
@router.post("/sessions/{session_id}/chat", response_model=ChatResponse)
def chat(session_id: str, message_data: MessageSend, user_id: str = Depends(get_current_user)):
    return send_message_to_session(user_id, session_id, message_data)
```

## Infrastructure Integration

### AWS Services
- **DynamoDB** - 5 tables with GSI indexes for efficient queries
- **S3** - File storage with presigned URL upload/download
- **AWS Bedrock** - OpenAI model integration for DS Bro chatbot
- **Terraform** - Infrastructure as Code for all AWS resources

### File Upload Flow
1. Frontend requests upload URL → `POST /projects/{id}/files/upload-url`
2. Backend creates DB record (status: UPLOADING) → Returns presigned URL
3. Frontend uploads directly to S3 → Bypasses backend for performance
4. Frontend confirms upload → `POST /files/{id}/confirm`
5. Backend updates status to COMPLETED → File ready for use

### Chat Flow with DS Bro
1. User sends message → `POST /sessions/{id}/chat`
2. Backend creates user message record → MessageDB with Role.USER
3. Backend gets recent chat history → For AI context
4. Backend calls AWS Bedrock → DS Bro generates response
5. Backend creates assistant message → MessageDB with Role.ASSISTANT
6. Returns ChatResponse → With AI message and metadata

## Future Scalability

Minimal architecture enables easy evolution:
- **Current**: Single FastAPI app with domain separation
- **Growth**: Extract high-traffic domains (chat, files) to separate services
- **Scale**: Each domain becomes independent microservice
- **Enterprise**: Domain-based team ownership with clear boundaries

Type-safe schemas and clean separation ensure smooth scaling without architectural debt.