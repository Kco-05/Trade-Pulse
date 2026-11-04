# TradePulse

Virtual stock trading simulator. Users get virtual cash, watch simulated live prices, buy and sell stocks, and track portfolio profit/loss.

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
cd tradepulse-ui && mvn cargo:run
```

## H2 consoles

- Wallet: http://localhost:8081/h2-console
- Market: http://localhost:8082/h2-console
- Portfolio: http://localhost:8083/h2-console

JDBC URL example: `jdbc:h2:file:./data/<db_name>` (see each service's `application.properties`).

## Demo login

- Username: `demo`
- Password: `demo123`

*(Seeded when wallet tables are empty — implemented in a later phase.)*

## API overview

See [docs/TECHNICAL.md](docs/TECHNICAL.md) §4.5 for full contracts.

- Wallet `8081`: register, login, balance, debit, credit
- Market `8082`: list/get stocks
- Portfolio `8083`: buy, sell, history, holdings
