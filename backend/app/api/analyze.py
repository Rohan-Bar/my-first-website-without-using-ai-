from fastapi import APIRouter
from pydantic import BaseModel
import re

router = APIRouter(prefix="/api", tags=["Analysis"])


class AnalyzeRequest(BaseModel):
    code: str
    language: str = "python"


@router.post("/analyse")
def analyse_code(request: AnalyzeRequest):

    code = request.code
    language = request.language

    issues = []

    lines = code.splitlines()

    for line_number, line in enumerate(lines, start=1):

        # SQL Injection
        if re.search(
            r"(SELECT|INSERT|UPDATE|DELETE).*['\"]\s*\+\s*\w+",
            line,
            re.IGNORECASE
        ):
            issues.append({
                "line": line_number,
                "title": "SQL Injection",
                "severity": "HIGH",
                "description": "User input appears to be directly concatenated into a SQL query.",
                "recommendation": "Use parameterized queries or prepared statements.",
                "code": line
            })

        # Hardcoded secret
        if re.search(
            r"(password|api_key|secret|token)\s*=\s*['\"][^'\"]+['\"]",
            line,
            re.IGNORECASE
        ):
            issues.append({
                "line": line_number,
                "title": "Hardcoded Secret",
                "severity": "HIGH",
                "description": "A sensitive credential appears to be stored directly in source code.",
                "recommendation": "Store secrets in environment variables.",
                "code": line
            })

        # eval / exec
        if re.search(r"\b(eval|exec)\s*\(", line):
            issues.append({
                "line": line_number,
                "title": "Code Injection",
                "severity": "HIGH",
                "description": "Dynamic code execution can allow arbitrary code execution.",
                "recommendation": "Avoid eval() and exec() with untrusted input.",
                "code": line
            })

        # XSS
        if re.search(r"(innerHTML|document\.write)", line):
            issues.append({
                "line": line_number,
                "title": "Cross-Site Scripting (XSS)",
                "severity": "MEDIUM",
                "description": "Raw content is being written into the page.",
                "recommendation": "Use textContent or properly sanitize untrusted HTML.",
                "code": line
            })

        # Insecure pickle
        if re.search(r"pickle\.loads\s*\(", line):
            issues.append({
                "line": line_number,
                "title": "Insecure Deserialization",
                "severity": "HIGH",
                "description": "Untrusted pickle data can lead to arbitrary code execution.",
                "recommendation": "Use a safe serialization format such as JSON.",
                "code": line
            })

    # Basic complexity estimation
    loop_count = len(re.findall(r"\b(for|while)\b", code))
    nested_loop = bool(
        re.search(
            r"(for|while)[\s\S]{0,500}(for|while)",
            code
        )
    )

    if nested_loop:
        time_complexity = "O(n²) estimated"
    elif loop_count:
        time_complexity = "O(n) estimated"
    else:
        time_complexity = "O(1) estimated"

    space_complexity = "O(1) estimated"

    bottleneck_lines = []

    for line_number, line in enumerate(lines, start=1):
        if re.search(r"\b(for|while)\b", line):
            bottleneck_lines.append(line_number)

    return {
        "success": True,
        "language": language,
        "issue_count": len(issues),
        "issues": issues,
        "complexity": {
            "time": time_complexity,
            "space": space_complexity,
            "bottleneck_lines": bottleneck_lines
        }
    }