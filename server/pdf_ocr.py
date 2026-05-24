import fitz
from paddleocr import PaddleOCR
from io import BytesIO

_ocr_engine = None

def load_ocr_engine():
    """
    Initializes and returns the PaddleOCR engine (singleton).
    """
    global _ocr_engine
    if _ocr_engine is None:
        _ocr_engine = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
    return _ocr_engine

def extract_text_with_ocr(pdf_bytes):
    """
    Converts PDF pages to images and uses PaddleOCR to extract text.
    """
    ocr_engine = load_ocr_engine()
    ocr_texts = []
    
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        for page in doc:
            pix = page.get_pixmap()
            img_data = pix.tobytes("png")
            # PaddleOCR can take image bytes/numpy array
            result = ocr_engine.ocr(img_data, cls=True)
            page_text = ""
            if result and result[0]:
                for res in result[0]:
                    page_text += res[1][0] + " "
            ocr_texts.append(page_text)
        return "\n".join(ocr_texts).strip()
    except Exception as e:
        print(f"PaddleOCR extraction failed: {e}")
        return ""
