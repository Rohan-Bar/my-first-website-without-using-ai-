from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.config import settings
from app.llm.groq_provider import GroqProvider


router = APIRouter(
    prefix="/api",
    tags=["AI Explanation"],
)


class ExplainRequest(BaseModel):
    vulnerability_id: str
    question: str


class ExplainResponse(BaseModel):
    answer: str


@router.post(
    "/explain",
    response_model=ExplainResponse,
)
def explain_vulnerability(
    request: ExplainRequest,
):

    if not request.question.strip():
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty.",
        )

    try:

        provider = GroqProvider(
            api_key=settings.GROQ_API_KEY,
            model=settings.GROQ_MODEL,
        )

        prompt = f"""
You are CodeShield AI, a cybersecurity
assistant that explains source-code vulnerabilities.

Detected vulnerability:
{request.vulnerability_id}

User question:
{request.question}

Explain the issue clearly for a developer.

Include when relevant:

1. What the vulnerability means
2. Why it is dangerous
3. How it can be abused
4. How to fix it
5. A small secure-code example

Do not claim that an attack was actually performed.
Do not execute any code.
Keep the answer concise and practical.
"""

        response = provider.client.chat.completions.create(

            model=provider.model,

            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are CodeShield AI, "
                        "a cybersecurity explanation assistant."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],

            temperature=0.2,
        )

        if not response.choices:
            raise ValueError(
                "Groq returned no choices."
            )

        answer = response.choices[0].message.content

        if not answer or not answer.strip():
            raise ValueError(
                "Groq returned an empty response."
            )

        return ExplainResponse(
            answer=answer.strip()
        )

    except Exception as exc:

        print(
            "CodeShield /api/explain error:",
            repr(exc),
        )

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )