from typing import List

from pydantic import BaseModel, Field


# =========================================================
# SINGLE LLM SECURITY ISSUE
# =========================================================

class LLMIssue(BaseModel):

    owasp_category: str

    type: str

    severity: str

    line: int

    description: str

    evidence: str

    secure_fix: str

    secure_code: str


# =========================================================
# COMPLETE LLM ANALYSIS RESULT
# =========================================================

class LLMAnalysisResult(BaseModel):

    issues: List[LLMIssue] = Field(
        default_factory=list
    )