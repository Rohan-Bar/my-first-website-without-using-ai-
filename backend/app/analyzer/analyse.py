import uuid

from fastapi import APIRouter

from app.config import settings
from app.schemas import (
    AnalyzeRequest,
    AnalyzeResponse,
    ComplexityResponse,
    DiffResponse,
    LLMIssueResponse,
)
from app.analyzer.security_analyzer import analyze_security
from app.analyzer.complexity_analyzer import analyze_complexity
from app.llm.service import LLMService


router = APIRouter(
    prefix="/api",
    tags=["Analysis"],
)


llm_service = LLMService(
    api_key=settings.GROQ_API_KEY,
    model=settings.GROQ_MODEL,
)


@router.post(
    "/analyze",
    response_model=AnalyzeResponse
)
def analyze_code(request: AnalyzeRequest):

    # =====================================================
    # 1. STATIC SECURITY ANALYSIS
    # =====================================================

    static_issues = analyze_security(request.code)


    # =====================================================
    # 2. LLM SECURITY ANALYSIS
    # =====================================================

    llm_result = llm_service.analyze_code(
        code=request.code,
        language=request.language,
    )


    # =====================================================
    # 3. CONVERT LLM ISSUES TO API RESPONSE FORMAT
    # =====================================================

    llm_issues = []

    for issue in llm_result.issues:

        severity = issue.severity.upper()

        if severity not in {
            "HIGH",
            "MEDIUM",
            "LOW",
        }:
            severity = "MEDIUM"

        llm_issues.append(
            LLMIssueResponse(
                owasp_category=issue.owasp_category,
                type=issue.type,
                severity=severity,
                line=issue.line,
                description=issue.description,
                evidence=issue.evidence,
                secure_fix=issue.secure_fix,
            )
        )


    # =====================================================
    # 4. COMPLEXITY ANALYSIS
    # =====================================================

    complexity_result = analyze_complexity(
        request.code
    )

    complexity = ComplexityResponse(
        time=complexity_result["time"],
        space=complexity_result["space"],
        bottleneck_lines=complexity_result[
            "bottleneck_lines"
        ],
    )


    # =====================================================
    # 5. CREATE SECURE CODE
    # =====================================================

    vulnerable_code = request.code.splitlines()

    secure_code = request.code


    # Use the first LLM-generated secure code
    # when the LLM has provided one.

    if llm_result.issues:

        generated_secure_code = (
            llm_result.issues[0].secure_code
        )

        if generated_secure_code.strip():

            secure_code = generated_secure_code


    secure_code_lines = secure_code.splitlines()


    # =====================================================
    # 6. FINAL RESPONSE
    # =====================================================

    return AnalyzeResponse(

        analysis_id=str(uuid.uuid4()),

        issues=static_issues,

        llm_issues=llm_issues,

        complexity=complexity,

        diff=DiffResponse(
            vulnerable=vulnerable_code,
            secure=secure_code_lines,
        ),
    )