import re
SENSITIVE_PATTERNS = [
    r"\bA/?C[:\s]*[X*\d]{6,}\b",
    r"\bIFSC[:\s]*[A-Z]{4}0[A-Z0-9]{6}\b",
    r"\b\d{6,}[X*\d]{4,}\b",
    r"\b[X*]{4}\s[X*]{4}\s[X*]{4}\s\d{4}\b",
    r"\b\d{10,}\b",
    r"\b[\w.+-]+@[\w-]+\.[\w.]+\b",
    r"\b[\w.]+@[\w]+\b",
    r"\b(HDFC\s*BANK|ICICI\s*BANK|STATE\s*BANK\s*OF\s*INDIA|SBI|AXIS\s*BANK|KOTAK\s*MAHINDRA\s*BANK|YES\s*BANK|PUNJAB\s*NATIONAL\s*BANK|BANK\s*OF\s*BARODA|CANARA\s*BANK|INDIAN\s*BANK|UNION\s*BANK\s*OF\s*INDIA|BANK\s*OF\s*INDIA|IDBI\s*BANK|INDUSIND\s*BANK|FEDERAL\s*BANK)\b",
]
def sanitize(text: str) -> str:
    for pattern in SENSITIVE_PATTERNS:
        text = re.sub(pattern, "[REDACTED]", text, flags=re.IGNORECASE)
    return text
