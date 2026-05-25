# Financialo — AI Bank Statement Analyser

> **Team:** Arjun Mitra, Tanisha Ghosh, Adrishikhar Chowdhury, Sounak Mal — STCET

An AI-powered platform that ingests PDF/CSV bank statements, extracts transactions, computes financial health scores, detects fraud, categorizes expenses, identifies recurring payments, and generates personalized AI-driven financial insights.

## Architecture

```
client/          Next.js 16 frontend (App Router, Tailwind, shadcn/ui)
server/          Python FastAPI backend + Streamlit alternative UI
```

- **Frontend** handles auth (Clerk), file upload, interactive dashboards, AI chatbot, and analytics.
- **Backend** parses statements (pdfplumber → regex → Gemini fallback), runs ML categorization (SetFit), computes health scores, and detects fraud.

## Features

- **Statement Parsing** — PDF/CSV ingestion with multi-strategy extraction and fallbacks
- **Transaction Categorization** — SetFit ML model (5 fine-tuned classes + rule-based for 10+ categories)
- **Financial Health Score** — Income/expense/savings rate with health label (Strong/Stable/Watch/Critical)
- **Fraud Detection** — Rule-based heuristics + optional LightGBM model (Streamlit)
- **Recurring Payment Detection** — Auto-identifies periodic expenses by merchant
- **AI Financial Story** — Groq-powered narrative summarising financial activity
- **AI Chatbot** — Context-aware Q&A about your statements (Groq llama-3.3-70b)
- **Budget Management** — Daily/weekly/monthly/yearly budget tracking in Supabase
- **PII Sanitization** — Automatic redaction of account numbers, IFSC, emails, UPI IDs
- **Analytics Dashboard** — MUI X-Charts, expense pie charts, balance timeline, budget cards
- **Data Export** — CSV download of extracted transactions

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind v4, shadcn/ui, MUI X-Charts, GSAP |
| Auth | Clerk |
| Backend | Python 3.11+, FastAPI, Uvicorn |
| ML | SetFit (sentence-transformers/all-MiniLM-L6-v2), scikit-learn, PyTorch (CPU) |
| OCR | _Not implemented (PaddleOCR deprecated)_ |
| PDF | pdfplumber, PyMuPDF |
| Database | Supabase (Postgres + Storage) |
| AI/LLM | Groq (llama-3.3-70b, gpt-oss-120b), Google Gemini (fallback parsing) |
| Analytics | PostHog |

## Getting Started

### Backend

```bash
cd server

# Using uv (recommended)
uv sync

# Or using pip
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env   # Set GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

# Run FastAPI server
python main.py         # Starts on http://localhost:8000

# Or run Streamlit dashboard (alternative UI)
streamlit run app.py
```

### Frontend

```bash
cd client
npm install

# Configure environment
# Create .env.local with Clerk, Supabase, Groq, and PostHog keys (see .env.local.example)

npm run dev            # Starts on http://localhost:3000
```

### Data Flow

```
Browser → Next.js /api/parse → FastAPI :8000/api/parse
  ├─ downloads file from Supabase Storage
  ├─ parses PDF/CSV (pdfplumber → regex → Gemini)
  ├─ runs ML categorization (SetFit)
  ├─ computes health score, recurring payments, fraud flags
  ├─ persists results to Supabase
  └─ returns structured JSON + CSV to frontend
```

## Environment Variables

### Backend (`server/.env`)

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Google Gemini key (fallback PDF parsing) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `PORT` | Server port (default 8000) |

### Frontend (`client/.env.local`)

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `GROQ_API_KEY` | Groq key (AI story generation) |
| `GROQ_CHAT_API_KEY` | Groq key (chatbot) |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | PostHog project token |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host |
| `NEXT_PUBLIC_APP_URL` | Frontend URL (http://localhost:3000) |

## Project Structure

```
├── client/                          # Next.js frontend
│   ├── app/                         # Pages (landing, dashboard, sign-in/up)
│   │   ├── api/parse/route.ts       # Parse proxy to FastAPI
│   │   └── dashboard/               # Dashboard views + analytics
│   ├── components/
│   │   ├── ui/                      # shadcn/ui primitives
│   │   └── application/             # File upload, charts, summary
│   ├── lib/actions/                 # Server actions (chat, insights, statements, users)
│   ├── types/                       # TypeScript type definitions
│   └── utils/                       # Supabase clients, formatters
├── server/                          # Python backend
│   ├── main.py                      # FastAPI entry point
│   ├── parser.py                    # PDF/CSV parsing engine
│   ├── analyzer.py                  # ML categorization + analysis pipeline
│   ├── pdf_ocr.py                   # PaddleOCR for scanned PDFs
│   ├── sanitization.py              # PII redaction
│   ├── app.py                       # Streamlit alternative UI
│   ├── db.py / config.py            # Supabase setup
│   └── fine_tuned_agami_transformer/ # SetFit model artifacts
└── .git/
```

## Challenges Faced

- **Diverse Statement Formats** — Indian bank statements vary wildly in layout (PDF tables, scanned images, CSV exports). Built a multi-strategy parsing pipeline (pdfplumber → regex → Gemini LLM) with self-healing fallbacks to maximise coverage.
- **ML Training Data** — No public dataset for Indian bank transaction categorisation. Fine-tuned a SetFit model on a small manually-labelled dataset with 5 classes and supplemented with rule-based heuristics for 10+ additional categories.
- **OCR Deprecation** — PaddleOCR was initially planned for scanned PDFs but could not be implemented due to its outdated and deprecated dependency chain. OCR-based extraction remains an open gap for handwritten or heavily scanned statements.
- **Clerk + Supabase JWT Integration** — Syncing Clerk authentication with Supabase Row-Level Security required custom JWT template configuration and careful token handling across server/client boundaries.
- **Large File Uploads** — Bank statements with hundreds of pages pushed against default server limits. Increased the Next.js body size limit to 50MB and implemented chunked processing on the backend.
- **PII Safety** — Account numbers, IFSC codes, UPI IDs, and email addresses appear in unpredictable locations. Designed a comprehensive regex-based sanitisation layer that runs before any data is persisted.
- **Cross-Platform Dependency Hell** — PaddleOCR and PyTorch CPU require specific system libraries. The `uv` lockfile helped, but platform-specific issues remain for Windows/macOS contributors.
- **Fraud Detection Without Labels** — No labelled fraud dataset was available. Started with rule-based heuristics (large outlier transactions, velocity checks) and trained a LightGBM model on synthetically-generated anomalies for the Streamlit dashboard.

## Future Roadmap

- **Multi-Currency & International Support** — Extend parsing and categorisation beyond Indian bank statements to international formats and currencies.
- **Real-Time Transaction Sync** — Integrate with banking APIs (e.g., Plaid, Yodlee, Account Aggregator framework) for live transaction feeds instead of statement uploads.
- **Improved Fraud Model** — Collect labelled fraud data through user feedback and train a production-grade classification model with explainability (SHAP/LIME).
- **Credit Score Integration** — Pull CIBIL/Experian scores and correlate spending patterns with credit behaviour.
- **Tax Summary Generation** — Auto-generate tax-saving investment reports (80C, 80D) and capital gains statements from transaction data.
- **Mobile App** — React Native or Flutter companion app with push notifications for budget alerts and fraud warnings.
- **Multi-User Family Accounts** — Shared dashboards for household budgeting with role-based access control.
- **Automated Investment Suggestions** — Analyse surplus cash and recommend SIP allocations, fixed deposits, or debt fund investments based on risk profile.
- **CI/CD & Testing** — Add unit/integration tests (pytest, Vitest), GitHub Actions CI, and automated deployment to cloud (Vercel + Railway/Fly.io).
- **On-Premise Deployment** — Docker Compose setup for enterprises that want to self-host without sending financial data to third-party APIs.

## License

MIT
