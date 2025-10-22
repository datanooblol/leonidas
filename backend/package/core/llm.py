import boto3
from abc import ABC, abstractmethod
from pydantic import BaseModel

def bedrock_driver(messages):
    return [dict(role=m['role'], content=[dict(text=m['content'])]) for m in messages]

class ModelResponse(BaseModel):
    model_name: str
    role: str
    content: str
    reason: str
    input_tokens: int
    output_tokens: int

def UserMessage(content:str)->dict:
    return dict(role='user', content=content)

class BaseLLM(ABC):
    def __init__(self, model_id,):
        self.model_id = model_id
    
    @abstractmethod
    def OutputMessage(self, response:dict) -> ModelResponse:
        """Abstract method to be implemented by child classes"""
        pass

    @abstractmethod
    def run(self, system_prompt:str, messages:list)->ModelResponse:
        """Abstract method to be implemented by child classes"""
        pass

class BaseBedrock(BaseLLM):
    def __init__(self, model_id):
        super().__init__(model_id)

    def get_model(self):
        return boto3.client('bedrock-runtime', region_name='us-east-1')

    def bedrock_driver(self, messages):
        return [dict(role=m['role'], content=[dict(text=m['content'])]) for m in messages]
    
    def run(self, system_prompt:str, messages:list)->ModelResponse:
        model = self.get_model()
        response = model.converse(
            modelId=self.model_id,
            messages=self.bedrock_driver(messages),
            system=[{"text": system_prompt}]
        )
        return self.OutputMessage(response)
    
class BedrockOpenAI(BaseBedrock):
    def __init__(self, model_id="openai.gpt-oss-20b-1:0"):
        super().__init__(model_id)

    def OutputMessage(self, response)->ModelResponse:
        proxy = response['output']['message']
        usage = response['usage']
        return ModelResponse(
            model_name=self.model_id,
            role=proxy['role'],
            content=proxy['content'][-1]['text'],
            reason=proxy['content'][0]['reasoningContent']['reasoningText']['text'],
            input_tokens=usage['inputTokens'],
            output_tokens=usage['outputTokens']
        )        