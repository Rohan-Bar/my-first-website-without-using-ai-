from .groq_provider import GroqProvider
from .schemas import LLMAnalysisResult


class LLMService:

    def __init__(
        self,
        api_key: str,
        model: str,
    ):

        self.provider = GroqProvider(
            api_key=api_key,
            model=model,
        )

    def analyze_code(
        self,
        code: str,
        language: str,
    ) -> LLMAnalysisResult:

        return self.provider.analyze_code(
            code=code,
            language=language,
        )