import os

from dotenv import load_dotenv

from app.llm.service import LLMService


# Load environment variables
load_dotenv()


# Get configuration
api_key = os.getenv("GROQ_API_KEY")
model = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")


if not api_key:
    raise ValueError("GROQ_API_KEY is not set.")


# Create LLM service
llm_service = LLMService(
    api_key=api_key,
    model=model
)


# Test code
code = """
import os

def ping(host):
    command = "ping -c 4 " + host
    os.system(command)
"""


# Analyze
result = llm_service.analyze_code(
    code=code,
    language="python"
)


# Print result
print("\n===== CodeShield LLM Result =====\n")

print("Number of issues:", len(result.issues))

for issue in result.issues:

    print("\nOWASP Category:", issue.owasp_category)
    print("Type:", issue.type)
    print("Severity:", issue.severity)
    print("Line:", issue.line)
    print("Description:", issue.description)
    print("Evidence:", issue.evidence)
    print("Secure Fix:", issue.secure_fix)