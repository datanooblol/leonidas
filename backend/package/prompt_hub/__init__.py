from pathlib import Path

def _run(filename):
    return Path(__file__).parent.joinpath(filename).read_text()

# class PromptHub:

#     @staticmethod
#     def generate_sql():
#         return _run(filename="generate_sql.md")

#     @staticmethod
#     def guide_question():
#         return _run(filename="guide_question.md")
    
from enum import Enum

class PromptHub(Enum):
    GENERATE_SQL = _run("generate_sql.md")
    GUIDE_QUESTION = _run("guide_question.md")