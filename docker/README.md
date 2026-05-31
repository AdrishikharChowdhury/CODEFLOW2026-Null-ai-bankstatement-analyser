# Docker Setup

This directory contains Dockerfiles and Compose configuration for running the entire AI Bank Statement Analyser stack locally.

## Architecture

```
client (Next.js :3000) ──> server (FastAPI :8000) ──> model (SetFit :8001)
                                  │                        │
                                  └──── Supabase ──────────┘
```

- **client** — Next.js 16 frontend with Clerk auth, Tailwind v4, shadcn/ui
- **server** — FastAPI backend for PDF/CSV parsing and data orchestration (Python 3.13, uv)
- **model** — SetFit ML service for transaction categorization (Python 3.11, uv, PyTorch CPU)

## Prerequisites

- Docker Engine 24+ with Compose plugin
- All required API keys (Clerk, Supabase, Groq, Gemini, PostHog)

## Quick Start

```bash
# 1. From project root, copy and fill in environment variables
cp docker/.env.example docker/.env
# Edit docker/.env with your keys

# 2. Build and start all services
docker compose -f docker/docker-compose.yml --env-file docker/.env up --build

# 3. Open http://localhost:3000
```

## Service Details

### Model Service (`:8001`)
- Runs first (server depends on it)
- Loads the fine-tuned SetFit model from `model/fine_tuned_agami_transformer/`
- Exposes `POST /predict` for ML analysis
- Connects to Supabase for reading/writing statement data

### Server (`:8000`)
- FastAPI entry point at `server/main.py`
- Exposes `POST /api/parse` — parses PDF/CSV, calls model service internally
- CORS configured for `http://localhost:3000`
- Connects to model service at `http://model:8001` (Docker internal DNS)

### Client (`:3000`)
- Next.js 16 standalone build
- `NEXT_PUBLIC_*` environment variables are baked at build time via Docker build args
- Server-side env vars (`CLERK_SECRET_KEY`, `GROQ_API_KEY`, etc.) passed at runtime
- Proxies parse requests to the server via its own `/api/parse` route

## Environment Variables

See `.env.example` for the full list. Key variables:

| Variable | Required | Source |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk Dashboard |
| `CLERK_SECRET_KEY` | Yes | Clerk Dashboard |
| `SUPABASE_URL` | Yes | Supabase Project Settings |
| `SUPABASE_SERVICE_KEY` | Yes | Supabase (publishable key) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase (service role key) |
| `GEMINI_API_KEY` | Yes | Google AI Studio |
| `GROQ_API_KEY` | Conditionally | Groq Console |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | No | PostHog Project Settings |

## Development

To rebuild a single service after code changes:

```bash
docker compose -f docker/docker-compose.yml --env-file docker/.env up --build <service>
# e.g. docker compose -f docker/docker-compose.yml --env-file docker/.env up --build server
```

To view logs for a specific service:

```bash
docker compose -f docker/docker-compose.yml logs -f <service>
```

## Notes

- The model service runs PyTorch CPU-only — no GPU passthrough configured
- Supabase is external (not containerised)
- The `client/next.config.ts` has `output: "standalone"` enabled for efficient Docker builds
- `server/.env` and `model/.env` are referenced directly by docker-compose via `env_file`
