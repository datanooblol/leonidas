from pathlib import Path

def _run(filename):
    return Path(__file__).parent.joinpath(filename).read_text()

class PromptHub:

    @property
    def generate_sql(self):
        return _run(filename="generate_sql.md")

    @property
    def guide_question(self):
        return _run(filename="guide_question.md")

    @property
    def chat_with_data(self):
        return _run(filename="chat_with_data.md")

    @property
    def chat_with_bro(self):
        return _run(filename="chat_with_bro.md")