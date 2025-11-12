import time
import requests
from .base import BaseLLM, ModelResponse

class BaseLocalLLM(BaseLLM):
    def __init__(self, model_id):
        super().__init__(model_id)
        self.endpoint_url: str = "http://localhost:11434/api/chat"

    def run(self, system_prompt:str, messages:list)->ModelResponse:
        start_time = time.time()
        payload = {
            "model": self.model_id,
            "messages": [dict(role="system", content=system_prompt)]+messages,
            "stream": False
        }
        response = requests.post(self.endpoint_url, json=payload)
        response_time_ms = int((time.time() - start_time) * 1000)
        return self.OutputMessage(response.json(), response_time_ms=response_time_ms)

class OllamaOpenAI(BaseLocalLLM):
    def __init__(self, model_id="gpt-oss:20b"):
        super().__init__(model_id)

    def OutputMessage(self, response, response_time_ms)->ModelResponse:
        return ModelResponse(
            model_name=self.model_id,
            role=response['message']['role'],
            content=response['message']['content'],
            reason=response['message']['thinking'],
            input_tokens=0,
            output_tokens=0,
            response_time_ms=response_time_ms
        )

class OllamaLlama(BaseLocalLLM):
    def __init__(self, model_id):
        super().__init__(model_id=model_id)
    
    def OutputMessage(self, response, response_time_ms)->ModelResponse:
        proxy = response['message']
        return ModelResponse(
            model_name=self.model_id,
            role=proxy['role'],
            content=proxy['content'],
            reason=proxy['content'],
            input_tokens=0,
            output_tokens=0,
            response_time_ms=response_time_ms
        )