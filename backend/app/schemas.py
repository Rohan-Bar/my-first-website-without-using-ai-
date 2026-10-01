from typing import Literal

from pydantic import BaseModel, Field


# =========================================================
# ANALYZE
# =========================================================

class AnalyzeRequest(BaseModel):

    code: str = Field(
        ...,
        min_length=1,
    )

    language: Literal[
        "python",
        "javascript",
        "java",
        "cpp",
    ]


class IssueResponse(BaseModel):

    id: str
    type: str
    severity: Literal[
        "HIGH",
        "MEDIUM",
        "LOW",
    ]
    line: int
    description: str
    vulnerable_snippet: str


class LLMIssueResponse(BaseModel):

    owasp_category: str
    type: str
    severity: Literal[
        "HIGH",
        "MEDIUM",
        "LOW",
    ]
    line: int
    description: str
    evidence: str
    secure_fix: str


class ComplexityResponse(BaseModel):

    time: str
    space: str
    bottleneck_lines: str


class DiffResponse(BaseModel):

    vulnerable: list[str]
    secure: list[str]


class AnalyzeResponse(BaseModel):

    analysis_id: str

    issues: list[IssueResponse]

    llm_issues: list[LLMIssueResponse]

    complexity: ComplexityResponse

    diff: DiffResponse


# =========================================================
# EXPLAIN
# =========================================================

class ExplainRequest(BaseModel):

    vulnerability_id: str

    question: str = Field(
        ...,
        min_length=1,
    )


class ExplainResponse(BaseModel):

    answer: str


# =========================================================
# GITHUB
# =========================================================

class GitHubFetchRequest(BaseModel):

    github_url: str