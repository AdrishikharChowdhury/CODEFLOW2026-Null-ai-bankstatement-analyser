# Financialo — Server

Python FastAPI backend for the AI Bank Statement Analyser.

## What It Does

- Parses PDF and CSV bank statements using a multi-strategy pipeline (pdfplumber table extraction → regex → Gemini LLM fallback)
- Runs ML-based transaction categorisation via a fine-tuned SetFit model (all-MiniLM-L6-v2, 5 classes)
- Computes financial health scores (Strong/Stable/Watch/Critical based on savings rate)
- Detects fraud via rule-based heuristics (large outlier transactions, repeating patterns)
- Identifies recurring payments by merchant name grouping
- Redacts PII (account numbers, IFSC, emails, UPI IDs, bank names) before persisting data
- Stores results in Supabase (Postgres + Storage)
- Includes a standalone Streamlit dashboard (`app.py`) with LightGBM fraud detection as an alternative UI

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/api/health` | Health check |
| `POST` | `/api/parse` | Parse a bank statement. Accepts `{ storage_path, file_name, file_type }`. Downloads from Supabase Storage, parses, sanitises, runs ML analysis, and returns structured results. |

## Tech Stack

| Category | Technology |
|---|---|
| Framework | FastAPI, Uvicorn |
| Language | Python 3.11+ |
| ML | SetFit 1.0.3, sentence-transformers 3.3.1, scikit-learn, PyTorch (CPU) |
| PDF | pdfplumber, PyMuPDF |
| Database | Supabase (supabase-py) |
| AI | Google Gemini 1.5 Flash (fallback parsing) |
| Alt. UI | Streamlit, Plotly, LightGBM |

## Setup

```bash
uv sync                     # or: pip install -r requirements.txt

# Configure environment
# SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY, PORT

python main.py              # FastAPI server on http://localhost:8000
streamlit run app.py        # Alternative Streamlit UI
```

## Project Structure

```
server/
├── main.py                  # FastAPI entry point, /api/parse endpoint
├── parser.py                # PDF/CSV parsing engine, financial health, recurring payments
├── analyzer.py              # SetFit model loading, ML categorisation pipeline
├── pdf_ocr.py               # OCR module (unused — PaddleOCR deprecated/incompatible)
├── sanitization.py          # PII redaction (account numbers, IFSC, UPI, emails, bank names)
├── db.py / config.py        # Supabase client setup
├── app.py                   # Standalone Streamlit dashboard (Alt UI)
├── util.py                  # JSON-safe serialisation helpers
├── pyproject.toml           # Dependencies and metadata
├── requirements.txt         # Legacy pip requirements
└── fine_tuned_agami_transformer/  # SetFit model artifacts
```

## Parsing Pipeline

1. Download file from Supabase Storage (`statements` bucket)
2. Extract text: pdfplumber for PDFs, pandas for CSVs
3. Regex-based block parsing to extract individual transactions
4. If no transactions found, fall back to Gemini LLM for AI extraction
5. Self-healing normalisation (column mapping, date parsing, numeric coercion)
6. PII sanitisation on all description fields
7. ML category prediction via SetFit (with rule-based fallback)
8. Financial health computation, recurring payment detection, fraud diagnostics

## Environment Variables

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `GEMINI_API_KEY` | Google Gemini API key (optional — for fallback parsing) |
| `PORT` | Server port (default 8000) |

## Notes

- OCR (PaddleOCR) was planned for scanned PDFs but could not be integrated — the library relies on outdated dependencies incompatible with Python 3.11+ and lacks maintained CPU wheels for Linux.
- The SetFit model is loaded once as a singleton and cached across requests.
- PII redaction runs before CSV/JSON output; raw data is never persisted.
