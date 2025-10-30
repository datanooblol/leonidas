from package.prompt_hub import PromptHub
from package.core.llm import ModelResponse
from package.utils.parse_string import parse_sql

class QueryMasterAgent:
    """
    1. Generate SQL queries
    2. Get results from database
    """
    def __init__(self, llm):
        self.llm = llm

    def run(self, messages:list) -> str:
        """Generate SQL query based on table metadata and user question."""
        response: ModelResponse = self.llm.run(PromptHub().generate_sql, messages)
        sql_query = parse_sql(response.content)
        return sql_query