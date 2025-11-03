from fastapi import HTTPException
from datetime import datetime
from .interface import MessageSend, ChatResponse, ChatHistoryResponse, MessageHistoryResponse, Artifact
from package.routers.sessions.database import get_session_by_id
from package.routers.projects.database import get_project_by_id
from package.routers.files.database import get_metadata_by_file_ids
from package.core.config import settings
from package.core.aws_config import get_aws_configs
from package.core.data_catalog import DataCatalog
from package.core.llm import BedrockOpenAI, UserMessage, ModelResponse, Role, LocalOpenAI
from .database import get_history, get_recent_history, create_user_message, create_assistant_message
from package.routers.files.database import get_selected_files_for_project
from package.core.interface import FileMetadata, FieldDetail
from package.prompt_hub import PromptHub
from package.agents.query_master import QueryMasterAgent
from typing import List

# Initialize DS Bro
if settings.MODEL_PROVIDER == "local":
    ds_bro = LocalOpenAI()
else:
    ds_bro = BedrockOpenAI()

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

# def send_message_to_session(user_id: str, session_id: str, message_data: MessageSend) -> ChatResponse:
#     """Send message and get AI response"""
#     validate_session(user_id, session_id)
    
#     # Create user message record
#     user_msg = create_user_message(session_id, user_id, message_data.content)
    
#     # Get recent history for AI context
#     recent_messages = get_recent_history(session_id, 10)
    
#     # Build conversation for AI
#     conversation = []
#     for msg in recent_messages[::-1]:
#         if msg.role == Role.USER:
#             conversation.append(UserMessage(content=msg.content))
#         else:
#             conversation.append(dict(role='assistant', content=msg.content))
    
#     # Get AI response
#     conversation.append(UserMessage(content=message_data.content))
#     # for convo in conversation:
#     #     print(f"{convo['role']}: {convo['content']}")
#     model_response = ds_bro.run(PromptHub().chat_with_bro, conversation)
    
#     # Create assistant message record
#     ai_msg = create_assistant_message(
#         session_id=session_id,
#         user_id=user_id,
#         content=model_response.content,
#         model_name=model_response.model_name,
#         input_tokens=model_response.input_tokens,
#         output_tokens=model_response.output_tokens,
#         response_time_ms=model_response.response_time_ms,
#         reason=model_response.reason
#     )
    
#     return ChatResponse(
#         id=ai_msg.message_id,
#         role=ai_msg.role,
#         content=ai_msg.content,
#         response_time_ms=ai_msg.response_time_ms,
#         input_tokens=ai_msg.input_tokens,
#         output_tokens=ai_msg.output_tokens,
#         reason=ai_msg.reason
#     )

# def send_message_with_data(user_id:str, session_id:str, message_data:ChatDataRequest):
#     validate_session(user_id, session_id)
#     # Create user message record
#     user_msg = create_user_message(session_id, user_id, message_data.content)
    
#     # Get recent history for AI context
#     recent_messages = get_recent_history(session_id, 10)
#     conversation = []
#     for msg in recent_messages[::-1]:
#         if msg.role == Role.USER:
#             conversation.append(UserMessage(content=msg.content))
#         else:
#             conversation.append(dict(role='assistant', content=msg.content))
    
#     file_ids = message_data.file_ids
#     file_metadata = get_metadata_by_file_ids(file_ids)
#     METADATAS = [
#         FileMetadata(name=metadata.filename.split(".")[0], description=metadata.description, columns=[mc.model_dump() for mc in metadata.columns]).prompt() 
#         for metadata in file_metadata
#     ]    
#     METADATAS = "\n".join(METADATAS)
#     SQL_REQUEST_PROMPT = f"METADATAS:\n\n{METADATAS}\n\nUSER QUERY:\n{message_data.content}"

#     sql_query = QueryMasterAgent(llm=ds_bro).run(conversation+[UserMessage(content=SQL_REQUEST_PROMPT)])
#     catalog = DataCatalog(aws_configs=get_aws_configs())
#     for fm in file_metadata:
#         catalog.register(fm.filename.split(".")[0], source=f"s3://{settings.FILE_BUCKET}/{fm.s3_key}")
#     results = catalog.query(sql_query)
#     RESULT_PROMPT = f"CONTEXT:\n\n{results.to_string(index=False)}\n\nUSER_INPUT:\n\n{message_data.content}\n\n"
#     model_response = ds_bro.run(PromptHub().chat_with_data, conversation+[UserMessage(content=RESULT_PROMPT)])
    
#     # Create assistant message record
#     ai_msg = create_assistant_message(
#         session_id=session_id,
#         user_id=user_id,
#         content=model_response.content,
#         model_name=model_response.model_name,
#         input_tokens=model_response.input_tokens,
#         output_tokens=model_response.output_tokens,
#         response_time_ms=model_response.response_time_ms,
#         reason=model_response.reason
#     )
    
#     return ChatResponse(
#         id=ai_msg.message_id,
#         role=ai_msg.role,
#         content=ai_msg.content,
#         response_time_ms=ai_msg.response_time_ms,
#         input_tokens=ai_msg.input_tokens,
#         output_tokens=ai_msg.output_tokens,
#         reason=ai_msg.reason
#     )

def _send_message_to_session(user_id: str, session_id: str, message_data: MessageSend, file_ids: List[str] = None) -> ChatResponse:
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
    
    artifacts = []  # Collect artifacts here
    
    # Handle data context if file_ids provided
    if file_ids:
        print(f"DEBUG: About to call get_metadata_by_file_ids with: {file_ids}")
        file_metadata = get_metadata_by_file_ids(file_ids)
        print(f"DEBUG: get_metadata_by_file_ids returned {len(file_metadata)} items")
        METADATAS = [
            FileMetadata(name=metadata.filename.split(".")[0], description=metadata.description, columns=[mc.model_dump() for mc in metadata.columns]).prompt() 
            for metadata in file_metadata
        ]    
        METADATAS = "\n".join(METADATAS)
        SQL_REQUEST_PROMPT = f"METADATAS:\n\n{METADATAS}\n\nUSER QUERY:\n{message_data.content}"
        
        sql_query = QueryMasterAgent(llm=ds_bro).run(conversation+[UserMessage(content=SQL_REQUEST_PROMPT)])
        print(sql_query) 
        # Add SQL query as artifact
        artifacts.append(Artifact(
            type="sql",
            content=sql_query,
            title="Generated SQL Query"
        ))
        
        catalog = DataCatalog(aws_configs=get_aws_configs())
        for fm in file_metadata:
            catalog.register(fm.filename.split(".")[0], source=f"s3://{settings.FILE_BUCKET}/{fm.s3_key}")
        results = catalog.query(sql_query)
        results_markdown = results.to_markdown()
        
        # Add data results as artifact
        artifacts.append(Artifact(
            type="results",
            content=results.to_json(orient="records"),
            title="Query Results"
        ))
        
        RESULT_PROMPT = f"CONTEXT:\n\n{results_markdown}\n\nUSER_INPUT:\n\n{message_data.content}\n\n"
        
        model_response = ds_bro.run(PromptHub().chat_with_data, conversation+[UserMessage(content=RESULT_PROMPT)])
    else:
        model_response = ds_bro.run(PromptHub().chat_with_bro, conversation+[UserMessage(content=message_data.content)])
    
    ai_msg = create_assistant_message(
        session_id=session_id,
        user_id=user_id,
        content=model_response.content,
        model_name=model_response.model_name,
        input_tokens=model_response.input_tokens,
        output_tokens=model_response.output_tokens,
        response_time_ms=model_response.response_time_ms,
        reason=model_response.reason,
        artifacts=[artifact.model_dump() for artifact in artifacts] if artifacts else None  # Add this line
    )    
    
    return ChatResponse(
        id=ai_msg.message_id,
        role=ai_msg.role,
        content=ai_msg.content,
        response_time_ms=ai_msg.response_time_ms,
        input_tokens=ai_msg.input_tokens,
        output_tokens=ai_msg.output_tokens,
        reason=ai_msg.reason,
        artifacts=artifacts if artifacts else None  # Add artifacts
    )


def send_message_with_selected_files(user_id: str, session_id: str, message_data: MessageSend, chat_with_data: bool) -> ChatResponse:
    """Send message using selected files from project"""
    validate_session(user_id, session_id)
    
    # Get session to find project_id
    session = get_session_by_id(session_id)
    
    # Get selected files for this project
    selected_files = get_selected_files_for_project(session.project_id)
    
    # Check both conditions: selected files AND chat_with_data flag
    if selected_files and chat_with_data:
        # Extract file_ids and use data chat logic
        file_ids = [file.file_id for file in selected_files]
        print(f"DEBUG: Using data chat with file_ids: {file_ids}")
        return _send_message_to_session(user_id, session_id, message_data, file_ids)
    else:
        # Use regular chat (no data context)
        print(f"DEBUG: Using regular chat (no data context)")
        return _send_message_to_session(user_id, session_id, message_data, None)


