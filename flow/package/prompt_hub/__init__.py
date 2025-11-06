from pathlib import Path

def _run(filename):
    return Path(__file__).parent.joinpath(filename).read_text()

class PromptHub:

    @property
    def get_intent(self):
        return _run(filename="get_intent.md")

