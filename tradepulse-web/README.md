# tradepulse-web

Primary TradePulse UI — Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui.

## Prerequisites

- Node.js 20+
- Backend services running (market `8082`, wallet `8081`, portfolio `8083`)

See the [root README](../README.md) for full start order.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |

## Demo login

- Username: `demo`
- Password: `demo123`

## Notes

- API calls use Next.js rewrites to the local microservices (no browser CORS).
- Session is an httpOnly `tp_uid` cookie set by `/api/session`.
- Do not add a DB driver, JPA, or business logic here — REST + render only.
