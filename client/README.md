# Financialo — Client

Next.js 16 frontend for the AI Bank Statement Analyser.

## What It Does

- Landing page with hero animation, feature showcase, and team contact
- Clerk-powered authentication (sign-in/sign-up with redirects)
- File upload dashboard with drag-and-drop PDF/CSV support
- Interactive analytics dashboards with charts, budget cards, and AI-generated financial stories
- AI chatbot that answers questions about uploaded statements (Groq llama-3.3-70b)
- AI financial story generation that produces a personalised narrative from transaction data
- Fraud detection alerts highlighting suspicious transactions (65K–80K range duplicates)
- Budget management (daily/weekly/monthly/yearly limits stored in Supabase)
- PostHog analytics tracking throughout the user journey

## Page Routes

| Route | Auth | Purpose |
|---|---|---|
| `/` | No | Landing page |
| `/sign-in` | No | Clerk sign-in |
| `/sign-up` | No | Clerk sign-up |
| `/dashboard` | Yes | Dashboard home with statement selector |
| `/dashboard/[id]` | Yes | Per-statement transaction detail view |
| `/dashboard/analytics` | Yes | Analytics overview with statement selector |
| `/dashboard/analytics/[id]` | Yes | Full analytics: charts, AI story, fraud alerts |
| `/dashboard/statements` | Yes | File upload (PDF/CSV) |
| `/dashboard/settings` | Yes | Budget configuration |

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui, Radix UI, Motion |
| Auth | Clerk |
| Database | Supabase (Postgres + Storage) |
| AI | Groq SDK (llama-3.3-70b for chat, gpt-oss-120b for story) |
| Charts | MUI X-Charts |
| Analytics | PostHog |
| Animation | GSAP |

## Setup

```bash
npm install

# Configure .env.local with Clerk, Supabase, Groq, and PostHog keys
# (see Environment Variables section below)

npm run dev                 # Development server on http://localhost:3000
npm run build               # Production build
npm run lint                # ESLint
```

## Architecture & Data Flow

```
User → File Upload → Server Action → Supabase Storage
                                  → /api/parse (Next.js) → FastAPI :8000/api/parse
                                                            → Parsing + ML Analysis
                                                            → Returns structured JSON
                                  → Stored in Supabase `statements` table
                                  → Rendered in Dashboard + Analytics
```

## Key Directories

```
client/
├── app/                          # App Router pages
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout (ClerkProvider, fonts)
│   ├── api/parse/route.ts        # Parse proxy to FastAPI
│   └── dashboard/                # All dashboard views
├── components/
│   ├── ui/                       # shadcn/ui primitives
│   ├── application/
│   │   ├── file-upload/          # Drag-and-drop upload with retry
│   │   └── charts/               # MUI X-Charts, budget metric cards
│   ├── Chatbot.tsx               # Floating AI assistant
│   ├── Navbar.tsx / Sidebar.tsx  # Navigation
│   └── ...                       # Landing page sections
├── lib/actions/                  # Server actions
│   ├── statements.action.ts      # Upload + parse orchestration
│   ├── insights.action.ts        # AI story + fraud detection
│   ├── chat.action.ts            # Chatbot (Groq)
│   └── users.action.ts           # User sync + budget CRUD
├── types/                        # TypeScript definitions
└── utils/                        # Supabase clients, formatters
```

## Environment Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `GROQ_API_KEY` | Groq key (AI story generation) |
| `GROQ_CHAT_API_KEY` | Groq key (chatbot) |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | PostHog token |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host |
| `NEXT_PUBLIC_APP_URL` | App base URL |

## Key Features

- **File Upload** — Drag-and-drop zone with progress indicator, retry on failure, PostHog event tracking
- **AI Story** — Generates 3–5 paragraph financial narrative via Groq (gpt-oss-120b), highlighting patterns, fraud, and actionable suggestions
- **Chatbot** — Context-aware floating chat that references the selected statement's transactions
- **Fraud Detection** — Scans for suspicious transactions (65K–80K range to same merchant) with visual alerts
- **Budget Management** — Daily/weekly/monthly/yearly budget config with Supabase persistence
- **Analytics** — Expense pie charts, balance timeline, budget metric cards via MUI X-Charts

## Notes

- The FastAPI backend must be running on `localhost:8000` for statement parsing to work.
- The backend URL is hardcoded in `app/api/parse/route.ts` — update if deploying separately.
