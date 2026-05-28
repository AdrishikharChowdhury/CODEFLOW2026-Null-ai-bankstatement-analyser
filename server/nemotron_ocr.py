import os
import base64
import httpx
import fitz
from dotenv import load_dotenv

load_dotenv()

NEMOTRON_API_KEY = os.getenv("NEMOTRON_API_KEY")
NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1"
OCR_MODEL = "nvidia/llama-3.2-nv-vision"

EXTRACTION_PROMPT = (
    "Extract all text from this bank statement page image. "
    "Return only the text content exactly as it appears, "
    "preserving all transaction details, dates, amounts, and descriptions."
)


def pdf_to_images(pdf_bytes, dpi=300):
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    images = []
    for page in doc:
        pix = page.get_pixmap(dpi=dpi)
        img_bytes = pix.tobytes("png")
        img_b64 = base64.b64encode(img_bytes).decode("utf-8")
        images.append(img_b64)
    return images


def image_to_text(image_b64, timeout=60):
    if not NEMOTRON_API_KEY:
        return ""

    url = f"{NVIDIA_BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {NEMOTRON_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": OCR_MODEL,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": EXTRACTION_PROMPT},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/png;base64,{image_b64}"},
                    },
                ],
            }
        ],
        "temperature": 0.0,
        "max_tokens": 4096,
    }

    try:
        with httpx.Client(timeout=timeout) as client:
            resp = client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print(f"Nemotron OCR page failed: {e}")
        return ""


def extract_text_with_nemotron(pdf_bytes):
    if not NEMOTRON_API_KEY:
        print("NEMOTRON_API_KEY not set, skipping OCR")
        return ""

    images = pdf_to_images(pdf_bytes)
    if not images:
        return ""

    page_texts = []
    for i, img_b64 in enumerate(images):
        print(f"Nemotron OCR: processing page {i + 1}/{len(images)}")
        text = image_to_text(img_b64)
        if text:
            page_texts.append(text)

    return "\n".join(page_texts).strip()
