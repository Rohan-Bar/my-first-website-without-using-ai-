def get_code_lines(code: str) -> list[str]:
    """Return source code as a list of lines."""
    return code.splitlines()


def create_basic_diff(code: str, issues: list[dict]) -> dict:
    """
    Create a basic vulnerable/secure representation.

    For now, security fixes are handled by the LLM later.
    This keeps the analyzer pipeline ready for that integration.
    """
    lines = get_code_lines(code)

    return {
        "vulnerable": lines,
        "secure": lines,
    }