from groq import Groq

from .parser import parse_llm_response
from .prompts import SECURITY_ANALYSIS_PROMPT
from .schemas import LLMAnalysisResult


class GroqProvider:

    def __init__(
        self,
        api_key: str,
        model: str,
    ):
        self.client = Groq(
            api_key=api_key
        )

        self.model = model


    def analyze_code(
        self,
        code: str,
        language: str,
    ) -> LLMAnalysisResult:

        response = self.client.chat.completions.create(

            model=self.model,

            messages=[

                {
                    "role": "system",
                    "content": SECURITY_ANALYSIS_PROMPT,
                },

                {
                    "role": "user",
                    "content": (
                        f"Analyze the following "
                        f"{language} source code.\n\n"
                        f"CODE:\n\n"
                        f"{code}"
                    ),
                },

            ],

            temperature=0,

            # Force the model to return JSON.
            response_format={
                "type": "json_object"
            },
        )


        # =================================================
        # CHECK RESPONSE
        # =================================================

        if not response.choices:

            raise ValueError(
                "Groq returned no choices."
            )


        message = response.choices[0].message

        raw_response = message.content


        # =================================================
        # DEBUG INFORMATION
        # =================================================

        print(
            "\n========== GROQ RESPONSE DEBUG =========="
        )

        print(
            "Model:",
            self.model
        )

        print(
            "Finish reason:",
            response.choices[0].finish_reason
        )

        print(
            "Response content length:",
            len(raw_response or "")
        )

        print(
            "==========================================\n"
        )


        # =================================================
        # EMPTY RESPONSE
        # =================================================

        if not raw_response or not raw_response.strip():

            finish_reason = (
                response.choices[0].finish_reason
            )

            raise ValueError(
                "Groq returned an empty response. "
                f"Finish reason: {finish_reason}"
            )


        # =================================================
        # PARSE + VALIDATE
        # =================================================

        return parse_llm_response(
            raw_response
        )