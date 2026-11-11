# TradePulse – Plan Index

## Current workstream
Docs authorization for `tradepulse-web` (primary Next.js UI) plus **Phase 1** foundation setup: Next.js App Router, theme tokens, API rewrites, typed client, TanStack Query hooks.

## Frontend phases
Full UI Component Roadmap: [docs/UI_PLAN.md](UI_PLAN.md)

Build order summary (from UI_PLAN §7):
1. Setup — Next.js, Tailwind, shadcn, theme tokens, proxy rewrites, typed API client, TanStack Query hooks
2. Auth and session
3. Market table
4. History endpoint (backend) + Lightweight Charts
5. Execution slip
6. Portfolio KPIs, charts, tables
7. Landing page
8. Polish

## Backend
Service contracts and tables: [docs/TECHNICAL.md](TECHNICAL.md). Requirements: [docs/REQUIREMENTS.md](REQUIREMENTS.md).

The only authorized new backend endpoint beyond the original contracts is `GET /api/stocks/{ticker}/history` (documented in TECHNICAL.md; implement when UI_PLAN reaches the charts step).
