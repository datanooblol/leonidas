from fastapi import HTTPException
from datetime import datetime
from .interface import MessageSend, ChatResponse, ChatHistoryResponse, MessageHistoryResponse, ChatDataRequest
from package.routers.sessions.database import get_session_by_id
from package.routers.projects.database import get_project_by_id
from package.routers.files.database import get_metadata_by_file_ids
from package.core.config import settings
from package.core.aws_config import get_aws_configs
from package.core.data_catalog import DataCatalog
from package.core.llm import BedrockOpenAI, UserMessage, ModelResponse, Role, LocalOpenAI
from .database import get_history, get_recent_history, create_user_message, create_assistant_message
from package.core.interface import FileMetadata, FieldDetail
from package.prompt_hub import PromptHub
from package.agents.query_master import QueryMasterAgent
from typing import List

# Initialize DS Bro
if settings.MODEL_PROVIDER == "local":
    ds_bro = LocalOpenAI()
else:
    ds_bro = BedrockOpenAI()

DS_BRO_PROMPT = """You are DS Bro, a friendly and expert AI Data Scientist assistant. Your personality:
- Call users "bro" or "buddy" in a friendly way
- Be enthusiastic about data science and analytics
- Provide practical, actionable advice
- Use casual but professional language
- Share insights about data analysis, machine learning, statistics
- Help with data visualization and interpretation
- Give best practices for data science workflows

Always be helpful, accurate, and encouraging while maintaining your friendly "bro" personality."""

def validate_session(user_id, session_id):
    # Verify session
    session = get_session_by_id(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Verify project ownership
    project = get_project_by_id(session.project_id, user_id)  # Use .project_id instead of ['project_id']
    if not project:
        raise HTTPException(status_code=404, detail="Session not found")    

def get_full_chat_history(user_id:str, session_id:str)->ChatHistoryResponse:
    validate_session(user_id, session_id)
    messages = get_history(session_id)
    clean_messages = [
        MessageHistoryResponse(
            message_id=msg.message_id,
            content=msg.content,
            role=msg.role,
            created_at=datetime.fromisoformat(msg.created_at)
        )
        for msg in messages
    ]
    
    return ChatHistoryResponse(
        session_id=session_id,
        messages=clean_messages
    )

def send_message_to_session(user_id: str, session_id: str, message_data: MessageSend) -> ChatResponse:
    """Send message and get AI response"""
    validate_session(user_id, session_id)
    
    # Create user message record
    user_msg = create_user_message(session_id, user_id, message_data.content)
    
    # Get recent history for AI context
    recent_messages = get_recent_history(session_id, 10)
    
    # Build conversation for AI
    conversation = []
    for msg in recent_messages[::-1]:
        if msg.role == Role.USER:
            conversation.append(UserMessage(content=msg.content))
        else:
            conversation.append(dict(role='assistant', content=msg.content))
    
    # Get AI response
    # print("Conversation len:", len(conversation))
    conversation.append(UserMessage(content=message_data.content))
    for convo in conversation:
        print(f"{convo['role']}: {convo['content']}")
    model_response = ds_bro.run(DS_BRO_PROMPT, conversation)
    
    # Create assistant message record
    ai_msg = create_assistant_message(
        session_id=session_id,
        user_id=user_id,
        content=model_response.content,
        model_name=model_response.model_name,
        input_tokens=model_response.input_tokens,
        output_tokens=model_response.output_tokens,
        response_time_ms=model_response.response_time_ms,
        reason=model_response.reason
    )
    
    return ChatResponse(
        id=ai_msg.message_id,
        role=ai_msg.role,
        content=ai_msg.content,
        response_time_ms=ai_msg.response_time_ms,
        input_tokens=ai_msg.input_tokens,
        output_tokens=ai_msg.output_tokens,
        reason=ai_msg.reason
    )

def send_message_with_data(user_id:str, session_id:str, message_data:ChatDataRequest):
    validate_session(user_id, session_id)
    # Create user message record
    user_msg = create_user_message(session_id, user_id, message_data.content)
    
    # Get recent history for AI context
    recent_messages = get_recent_history(session_id, 10)
    conversation = []
    for msg in recent_messages[::-1]:
        if msg.role == Role.USER:
            conversation.append(UserMessage(content=msg.content))
        else:
            conversation.append(dict(role='assistant', content=msg.content))
    
    # Get AI response
    # print("Conversation len:", len(conversation))
    file_ids = message_data.file_ids  # Use file ids as needed
    file_metadata = get_metadata_by_file_ids(file_ids)
    # return file_metadata
    # print("File metadata:", file_metadata)
    # METADATAS = [FileMetadata(name=metadata.filename, description=metadata.description, columns=metadata.columns).prompt() for metadata in file_metadata]
    METADATAS = [
        FileMetadata(name=metadata.filename.split(".")[0], description=metadata.description, columns=[mc.model_dump() for mc in metadata.columns]).prompt() 
        for metadata in file_metadata
    ]    
    # print("METADATAS:", METADATAS)
    METADATAS = "\n".join(METADATAS)
    # Build conversation for AI
    SQL_REQUEST_PROMPT = f"METADATAS:\n\n{METADATAS}\n\nUSER QUERY:\n{message_data.content}"
    # conversation.append(UserMessage(content=CONTENT))

    sql_query = QueryMasterAgent().run(conversation+[UserMessage(content=SQL_REQUEST_PROMPT)])
    catalog = DataCatalog(aws_configs=get_aws_configs())
    for fm in file_metadata:
        catalog.register(fm.filename.split(".")[0], source=f"s3://{settings.FILE_BUCKET}/{fm.s3_key}")
    results = catalog.query(sql_query)
    RESULT_PROMPT = f"CONTEXT:\n\n{results.to_string(index=False)}\n\nUSER_INPUT:\n\n{message_data.content}\n\n"
    # user_input = f"CONTEXT:\n\n{context}\n\nUSER_INPUT:\n\n{message}\n\n"
    model_response = ds_bro.run(PromptHub().chat_with_data, conversation+[UserMessage(content=RESULT_PROMPT)])
    
    # Create assistant message record
    ai_msg = create_assistant_message(
        session_id=session_id,
        user_id=user_id,
        content=model_response.content,
        model_name=model_response.model_name,
        input_tokens=model_response.input_tokens,
        output_tokens=model_response.output_tokens,
        response_time_ms=model_response.response_time_ms,
        reason=model_response.reason
    )
    
    return ChatResponse(
        id=ai_msg.message_id,
        role=ai_msg.role,
        content=ai_msg.content,
        response_time_ms=ai_msg.response_time_ms,
        input_tokens=ai_msg.input_tokens,
        output_tokens=ai_msg.output_tokens,
        reason=ai_msg.reason
    )

def test_send_message_to_session(user_id: str, session_id: str, message_data: MessageSend, file_ids: List[str] = None) -> ChatResponse:
    """Send message and get AI response, optionally with data context"""
    validate_session(user_id, session_id)
    
    # Create user message record
    user_msg = create_user_message(session_id, user_id, message_data.content)
    
    # Get recent history for AI context
    recent_messages = get_recent_history(session_id, 10)
    conversation = []
    for msg in recent_messages[::-1]:
        if msg.role == Role.USER:
            conversation.append(UserMessage(content=msg.content))
        else:
            conversation.append(dict(role='assistant', content=msg.content))
    
    # Handle data context if file_ids provided
    if file_ids:
        file_metadata = get_metadata_by_file_ids(file_ids)
        METADATAS = [
            FileMetadata(name=metadata.filename.split(".")[0], description=metadata.description, columns=[mc.model_dump() for mc in metadata.columns]).prompt() 
            for metadata in file_metadata
        ]    
        METADATAS = "\n".join(METADATAS)
        SQL_REQUEST_PROMPT = f"METADATAS:\n\n{METADATAS}\n\nUSER QUERY:\n{message_data.content}"
        
        sql_query = QueryMasterAgent().run(conversation+[UserMessage(content=SQL_REQUEST_PROMPT)])
        catalog = DataCatalog(aws_configs=get_aws_configs())
        for fm in file_metadata:
            catalog.register(fm.filename.split(".")[0], source=f"s3://{settings.FILE_BUCKET}/{fm.s3_key}")
        results = catalog.query(sql_query)
        results = results.to_markdown()
        RESULT_PROMPT = f"CONTEXT:\n\n{results}\n\nUSER_INPUT:\n\n{message_data.content}\n\n"
        
        model_response = ds_bro.run(PromptHub().chat_with_data, conversation+[UserMessage(content=RESULT_PROMPT)])
        model_response.content = f"Retrived Result:\n\n{results}\n\n" + model_response.content
    else:
        # Regular chat without data
        # conversation.append(UserMessage(content=message_data.content))
        model_response = ds_bro.run(DS_BRO_PROMPT, conversation+[UserMessage(content=message_data.content)])
    
    # Create assistant message record
    ai_msg = create_assistant_message(
        session_id=session_id,
        user_id=user_id,
        content=model_response.content,
        model_name=model_response.model_name,
        input_tokens=model_response.input_tokens,
        output_tokens=model_response.output_tokens,
        response_time_ms=model_response.response_time_ms,
        reason=model_response.reason
    )
    
    return ChatResponse(
        id=ai_msg.message_id,
        role=ai_msg.role,
        content=ai_msg.content,
        response_time_ms=ai_msg.response_time_ms,
        input_tokens=ai_msg.input_tokens,
        output_tokens=ai_msg.output_tokens,
        reason=ai_msg.reason
    )
