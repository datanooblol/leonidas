from package.prompt_hub import PromptHub
from package.llms import ModelResponse, BaseLLM
from package.utils.parse_string import parse_blockcode

class ChartBuilder:
    """
    1. Generate Plotly code
    2. Run plotly code
    3. Return plotly json string
    """
    def __init__(self, llm:BaseLLM):
        self.llm = llm

    def run(self, results, messages:list) -> str:
        """Generate plotly blockcode based on sql, results from database and user question."""
        response: ModelResponse = self.llm.run(PromptHub().chart_builder, messages)
        try:
            python_code = parse_blockcode(response.content, "python")
            # print("Generated code:", python_code)  # Debug
            
            local_vars = {}
            exec(python_code, {"__builtins__": __builtins__}, local_vars)
            # print("Available functions:", list(local_vars.keys()))  # Debug
            
            # if "create_chart" not in local_vars:
            #     raise KeyError("create_chart function not found in generated code")
                
            fig = local_vars["create_chart"](results)
            return fig.to_json()
        except Exception as e:
            print(f"Error: {e}")
            return None
