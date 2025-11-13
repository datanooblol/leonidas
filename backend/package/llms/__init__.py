from .bedrock import *
from .ollama import *
from .base import *

class ModelFactory:
    _model_registry = {
        "LLAMA3_2_11b_BR": lambda: BedrockLLama("us.meta.llama3-2-11b-instruct-v1:0"),
        "NOVA_MICRO_BR": lambda: BedrockNova("us.amazon.nova-micro-v1:0"),
        "NOVA_LITE_BR": lambda: BedrockNova("us.amazon.nova-lite-v1:0"),
        "OPENAI_20b_BR": lambda: BedrockOpenAI("openai.gpt-oss-20b-1:0"),
        "OPENAI_120b_BR": lambda: BedrockOpenAI("openai.gpt-oss-120b-1:0"), 
        "CLAUDE_HAIKU4_5_BR": lambda: BedrockClaude("global.anthropic.claude-haiku-4-5-20251001-v1:0"),
        "LLAMA3_2_11b_LC": lambda: OllamaLlama("llama3.2-vision:11b"),
        "OPENAI_20b_LC": lambda: OllamaOpenAI("gpt-oss:20b"),
    }
    
    @classmethod
    def create_model(cls, model_name: str) -> BaseLLM:
        if model_name not in cls._model_registry:
            raise ValueError(f"Model {model_name} not available")
        return cls._model_registry[model_name]()
    
    @classmethod
    def get_available_models(cls) -> list[str]:
        return list(cls._model_registry.keys())

    @classmethod
    def map_key_to_id(cls, model_key):
        return cls._model_registry[model_key]().model_id

    @classmethod
    def map_id_to_key(cls, model_id):
        for key, model in cls._model_registry.items():
            if model().model_id == model_id:
                return key
