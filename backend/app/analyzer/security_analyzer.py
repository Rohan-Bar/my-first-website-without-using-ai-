from app.analyzer.rules import run_all_rules


def analyze_security(code: str):
    """
    Run all static security rules against the supplied source code.
    """
    return run_all_rules(code)