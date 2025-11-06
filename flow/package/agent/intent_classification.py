from package.prompt_hub import PromptHub
from package.core.llm import ModelResponse

class IntentClassificationAgent:
    """
    Determine the user’s intent based on the following
    1. Suggest questions → The user wants you to suggest additional or follow-up questions to explore data or insights further.  
    2. Suggest actions from insight → The user wants recommendations, next steps, or actions based on some insight or observation.  
    3. Ask a question → The user is simply asking a factual or informational question.
    """
    def __init__(self, llm):
        self.llm = llm

    def run(self, messages:list) -> str:
        response: ModelResponse = self.llm.run(system_prompt=PromptHub().get_intent, messages=messages)
        return response.content