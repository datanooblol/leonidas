from datetime import datetime
from fastapi import HTTPException
from typing import List, Optional
from package.core.repositories import MessageRepository, SessionRepository, ProjectRepository, FileRepository
from package.schemas.message import Message
from package.core.llm import BedrockOpenAI, LocalOpenAI, UserMessage, Role
from package.core.config import settings
from package.core.aws_config import get_aws_configs
from package.core.data_catalog import DataCatalog
from package.core.interface import FileMetadata
from package.prompt_hub import PromptHub
from package.agents.query_master import QueryMasterAgent
from package.routers.chat.interface import MessageSend, ChatResponse, ChatHistoryResponse, MessageHistoryResponse, Artifact

class ChatService:
    def __init__(self, message_repo: MessageRepository, session_repo: SessionRepository, 
                 project_repo: ProjectRepository, file_repo: FileRepository):
        self.message_repo = message_repo
        self.session_repo = session_repo
        self.project_repo = project_repo
        self.file_repo = file_repo
        
        # Initialize AI client
        if settings.MODEL_PROVIDER == "local":
            self.ai_client = LocalOpenAI()
        else:
            self.ai_client = BedrockOpenAI()
    
    async def validate_session_access(self, session_id: str, user_id: str):
        """Validate user has access to session"""
        session = await self.session_repo.get_by_id(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Verify project ownership
        project = await self.project_repo.get_by_id_and_user(session.project_id, user_id)
        if not project:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return session
    
    async def get_chat_history(self, session_id: str, user_id: str) -> ChatHistoryResponse:
        """Get full chat history for a session"""
        await self.validate_session_access(session_id, user_id)
        
        messages = await self.message_repo.get_by_session_id(session_id)
        
        message_responses = [
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
            messages=message_responses
        )
    
    async def send_message(self, session_id: str, user_id: str, message_data: MessageSend) -> ChatResponse:
        """Send message and get AI response"""
        session = await self.validate_session_access(session_id, user_id)
        
        # Create user message record
        user_msg = await self.message_repo.create_user_message(session_id, user_id, message_data.content)
        
        # Get recent history for AI context
        recent_messages = await self.message_repo.get_recent_by_session_id(session_id, 10)
        conversation = []
        
        for msg in reversed(recent_messages):  # Reverse to get chronological order
            if msg.role == Role.USER:
                conversation.append(UserMessage(content=msg.content))
            else:
                conversation.append(dict(role='assistant', content=msg.content))
        
        artifacts = []
        
        # Handle data context if requested
        if message_data.chat_with_data:
            # Get selected files for this project
            selected_files = await self.file_repo.get_selected_by_project(session.project_id)
            
            if selected_files:
                file_ids = [file.file_id for file in selected_files]
                file_metadata = await self.file_repo.batch_get_by_ids(file_ids)
                
                # Build metadata for SQL generation
                metadatas = [
                    FileMetadata(
                        name=metadata.filename.split(".")[0], 
                        description=metadata.description, 
                        columns=[mc.model_dump() for mc in metadata.columns]
                    ).prompt() 
                    for metadata in file_metadata
                ]
                metadatas_str = "\n".join(metadatas)
                sql_request_prompt = f"METADATAS:\n\n{metadatas_str}\n\nUSER QUERY:\n{message_data.content}"
                
                # Generate SQL query
                sql_query = QueryMasterAgent(llm=self.ai_client).run(
                    conversation + [UserMessage(content=sql_request_prompt)]
                )
                
                # Add SQL query as artifact
                artifacts.append(Artifact(
                    type="sql",
                    content=sql_query,
                    title="Generated SQL Query"
                ))
                
                # Execute query
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
                
                # Generate AI response with data context
                result_prompt = f"CONTEXT:\n\n{results_markdown}\n\nUSER_INPUT:\n\n{message_data.content}\n\n"
                model_response = self.ai_client.run(
                    PromptHub().chat_with_data, 
                    conversation + [UserMessage(content=result_prompt)]
                )
            else:
                # No selected files, use regular chat
                model_response = self.ai_client.run(
                    PromptHub().chat_with_bro, 
                    conversation + [UserMessage(content=message_data.content)]
                )
        else:
            # Regular chat without data context
            model_response = self.ai_client.run(
                PromptHub().chat_with_bro, 
                conversation + [UserMessage(content=message_data.content)]
            )
        
        # Create assistant message record
        ai_msg = await self.message_repo.create_assistant_message(
            session_id=session_id,
            user_id=user_id,
            content=model_response.content,
            model_name=model_response.model_name,
            input_tokens=model_response.input_tokens,
            output_tokens=model_response.output_tokens,
            response_time_ms=model_response.response_time_ms,
            reason=model_response.reason,
            artifacts=[artifact.model_dump() for artifact in artifacts] if artifacts else None
        )
        
        return ChatResponse(
            id=ai_msg.message_id,
            role=ai_msg.role,
            content=ai_msg.content,
            response_time_ms=ai_msg.response_time_ms,
            input_tokens=ai_msg.input_tokens,
            output_tokens=ai_msg.output_tokens,
            reason=ai_msg.reason,
            artifacts=artifacts if artifacts else None
        )