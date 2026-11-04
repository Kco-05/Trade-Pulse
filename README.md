# TradePulse

Virtual stock trading simulator. Users get virtual cash, watch simulated live prices, buy and sell stocks, and track portfolio profit/loss.

## Prerequisites

- Java 17+
- Maven 3.9+

## Components

| Component | Port | How to run |
|-----------|------|------------|
| stock-market-service | 8082 | `mvn spring-boot:run` |
| user-wallet-service | 8081 | `mvn spring-boot:run` |
| trading-portfolio-service | 8083 | `mvn spring-boot:run` |
| tradepulse-ui | 8080 | `mvn cargo:run` (or deploy WAR to Tomcat 10.1) |

## Start order

1. stock-market-service (8082)
2. user-wallet-service (8081)
3. trading-portfolio-service (8083)
4. tradepulse-ui (8080)

```bash
cd stock-market-service && mvn spring-boot:run
cd user-wallet-service && mvn spring-boot:run
cd trading-portfolio-service && mvn spring-boot:run
cd tradepulse-ui && mvn package cargo:run
```

The UI runs on Tomcat 10.1 started by the Cargo plugin. The first `cargo:run` downloads the Tomcat zip from Maven Central into `~/.m2`. Run `mvn package` first so Cargo deploys the latest WAR. Open http://localhost:8080/ (redirects to the login page).

## Demo login

- Username: `demo`
- Password: `demo123`

Seeded by the wallet service when the `users` table is empty.

## H2 consoles

| Service | Console | JDBC URL |
|---------|---------|----------|
| Wallet | http://localhost:8081/h2-console | `jdbc:h2:file:./data/wallet` |
| Market | http://localhost:8082/h2-console | `jdbc:h2:file:./data/market` |
| Portfolio | http://localhost:8083/h2-console | `jdbc:h2:file:./data/portfolio` |

Use a blank password (or the defaults shown in each service's `application.properties`).

## UI notes

- Stack: Jakarta Faces 4 (Mojarra), PrimeFaces 13 (saga theme), Weld 5 for CDI, on Tomcat 10.1.
- Backend URLs live in `tradepulse-ui/src/main/resources/application.properties`.
- `AuthFilter` redirects any page except login, register and Faces resources to `login.xhtml` when no user is signed in. AJAX requests get a Faces partial-response redirect.
- Design tokens (colors, type scale, spacing, radius) are CSS variables at the top of `src/main/webapp/resources/css/app.css`. Fonts are Space Grotesk (headings) and IBM Plex Sans (body) from Google Fonts, falling back to Segoe UI when offline.

## API overview

See [docs/TECHNICAL.md](docs/TECHNICAL.md) §4.5 for full contracts.

- Wallet `8081`: register, login, balance, debit, credit
- Market `8082`: list/get stocks
- Portfolio `8083`: buy, sell, history, holdings

## Docs

- [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) — functional and business rules
- [docs/TECHNICAL.md](docs/TECHNICAL.md) — APIs, schema, trade flows
- [docs/LIMITATIONS.md](docs/LIMITATIONS.md) — simplified auth, no distributed transactions, compensation only
