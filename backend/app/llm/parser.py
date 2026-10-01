import json
import re

from .schemas import LLMAnalysisResult


def parse_llm_response(raw_response: str) -> LLMAnalysisResult:
    """
    Convert the raw LLM response into validated
    CodeShield security-analysis data.

    Handles:
    - Pure JSON
    - JSON inside Markdown code fences
    - Extra text surrounding JSON
    - Whitespace/newline variations

    Raises ValueError when no valid CodeShield
    response can be extracted.
    """

    if raw_response is None:
        raise ValueError(
            "LLM returned an empty response."
        )

    raw_response = str(raw_response).strip()

    if not raw_response:
        raise ValueError(
            "LLM returned an empty response."
        )


    # =====================================================
    # 1. REMOVE MARKDOWN CODE FENCES
    # =====================================================

    cleaned = raw_response

    cleaned = re.sub(
        r"^```(?:json)?\s*",
        "",
        cleaned,
        flags=re.IGNORECASE
    )

    cleaned = re.sub(
        r"\s*```$",
        "",
        cleaned
    )

    cleaned = cleaned.strip()


    # =====================================================
    # 2. TRY DIRECT JSON PARSING
    # =====================================================

    try:

        data = json.loads(cleaned)

        return LLMAnalysisResult.model_validate(data)

    except json.JSONDecodeError:
        pass

    except Exception as exc:

        raise ValueError(
            "LLM response does not match the expected "
            "CodeShield format."
        ) from exc


    # =====================================================
    # 3. EXTRACT JSON OBJECT FROM EXTRA TEXT
    # =====================================================

    start = cleaned.find("{")
    end = cleaned.rfind("}")


    if start != -1 and end != -1 and end > start:

        json_candidate = cleaned[
            start:end + 1
        ].strip()


        try:

            data = json.loads(
                json_candidate
            )

            return LLMAnalysisResult.model_validate(
                data
            )

        except json.JSONDecodeError:
            pass

        except Exception as exc:

            raise ValueError(
                "LLM response does not match the expected "
                "CodeShield format."
            ) from exc


    # =====================================================
    # 4. NO VALID JSON FOUND
    # =====================================================

    preview = cleaned[:300]

    raise ValueError(
        "LLM returned invalid JSON. "
        f"Response preview: {preview}"
    )