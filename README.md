# TradePulse

Virtual stock trading simulator. Users get virtual cash, watch simulated live prices, buy and sell stocks, and track portfolio profit/loss.

## Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 20+ (for `tradepulse-web`)

## Components

| Component | Port | How to run |
|-----------|------|------------|
| stock-market-service | 8082 | `mvn spring-boot:run` |
| user-wallet-service | 8081 | `mvn spring-boot:run` |
| trading-portfolio-service | 8083 | `mvn spring-boot:run` |
| **tradepulse-web** (primary UI) | 3000 | `npm run dev` |
| tradepulse-ui (legacy JSF fallback) | 8080 | `mvn package cargo:run` |

## Start order

1. stock-market-service (8082)
2. user-wallet-service (8081)
3. trading-portfolio-service (8083)
4. tradepulse-web (3000)

Open four terminals:

```bash
cd stock-market-service && mvn spring-boot:run
cd user-wallet-service && mvn spring-boot:run
cd trading-portfolio-service && mvn spring-boot:run
cd tradepulse-web && npm install && npm run dev
```

Then open http://localhost:3000

## Demo login

- Username: `demo`
- Password: `demo123`

Seeded by the wallet service when the `users` table is empty.

## App routes (tradepulse-web)

| Path | Access | Notes |
|------|--------|-------|
| `/` | Public | Landing page |
| `/login`, `/signup` | Public | Auth (tabs in one card) |
| `/market` | Public | Live market; trade slip locked when logged out |
| `/portfolio`, `/history` | Protected | Require session cookie `tp_uid` |

## H2 consoles

| Service | Console | JDBC URL |
|---------|---------|----------|
| Wallet | http://localhost:8081/h2-console | `jdbc:h2:file:./data/wallet` |
| Market | http://localhost:8082/h2-console | `jdbc:h2:file:./data/market` |
| Portfolio | http://localhost:8083/h2-console | `jdbc:h2:file:./data/portfolio` |

Use a blank password (or the defaults shown in each service's `application.properties`).

## Architecture notes

- Three independent Spring Boot microservices, each with its own H2 file database. No shared DB.
- Services talk only over REST/JSON.
- **tradepulse-web** (Next.js App Router, TypeScript, Tailwind, shadcn/ui) is the primary UI. It has no DB driver and no business logic — it only calls REST and renders.
- Next.js rewrites proxy browser calls (no Spring CORS required):
  - `/api/users/*` → wallet `8081`
  - `/api/stocks/*` → market `8082`
  - `/api/trade/*` and `/api/portfolio/*` → portfolio `8083`
- Auth is simplified: login sets an httpOnly `tp_uid` cookie. No JWT / Spring Security.
- **tradepulse-ui** (JSF/PrimeFaces on Tomcat) is retained as a lab fallback and should not be edited for new features.

## API overview

See [docs/TECHNICAL.md](docs/TECHNICAL.md) for full contracts.

- Wallet `8081`: register, login, balance, debit, credit
- Market `8082`: list/get stocks, price history
- Portfolio `8083`: buy, sell, history, holdings

## Docs

- [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) — functional and business rules
- [docs/TECHNICAL.md](docs/TECHNICAL.md) — APIs, schema, trade flows
- [docs/UI_PLAN.md](docs/UI_PLAN.md) — frontend component roadmap
- [docs/LIMITATIONS.md](docs/LIMITATIONS.md) — simplified auth, no distributed transactions, compensation only
