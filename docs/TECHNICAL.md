# TradePulse – Technical Specification

## 4.1 Repo layout
Three independent Maven services (no parent POM needed, each is standalone), plus two UIs:
- stock-market-service: com.tradepulse.market, port 8082
- user-wallet-service: com.tradepulse.wallet, port 8081
- trading-portfolio-service: com.tradepulse.portfolio, port 8083
- tradepulse-web: Next.js App Router app, port 3000 (primary UI)
- tradepulse-ui: war, com.tradepulse.ui, runs on Tomcat 10.1 at port 8080, context path / (legacy / fallback; do not edit)

## 4.2 Dependencies
Services (all three): spring-boot-starter-web, spring-boot-starter-data-jpa, spring-boot-starter-validation, h2 (runtime), spring-boot-starter-test (test).
Wallet only, additionally: org.springframework.security:spring-security-crypto (BCrypt only).
UI (legacy tradepulse-ui): jakarta.faces (Mojarra 4.0.x), primefaces (13+, classifier jakarta), weld-servlet-shaded (Weld 5.x, jakarta), jackson-databind, jackson-datatype-jsr310, jakarta.servlet-api (provided). Packaging war.
UI config files: WEB-INF/web.xml (FacesServlet mapped to *.xhtml, Weld listener org.jboss.weld.environment.servlet.Listener), WEB-INF/beans.xml (bean-discovery-mode="all"), WEB-INF/faces-config.xml (version 4.0), META-INF/context.xml with the Weld BeanManager resource reference (Tomcat needs this). To run from Maven use the Cargo plugin with tomcat10x, or deploy the WAR to a local Tomcat 10.1.
Web (tradepulse-web): Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui. See §4.11.

## 4.3 application.properties (per service)
server.port=<8081|8082|8083>
spring.datasource.url=jdbc:h2:file:./data/<db_name>;AUTO_SERVER=TRUE
spring.jpa.hibernate.ddl-auto=update
spring.h2.console.enabled=true
spring.jpa.open-in-view=false
Portfolio only: market.base-url=http://localhost:8082 and wallet.base-url=http://localhost:8081
UI (legacy): base URLs read from a properties file on the classpath, same three URLs.
Web (tradepulse-web): reaches backends via Next.js rewrites (see §4.11); no Spring properties file.

## 4.4 Entities and tables
users (wallet): user_id BIGINT PK auto, username VARCHAR(50) unique not null, password VARCHAR(255) not null (BCrypt hash), wallet_balance DECIMAL(15,2) not null default 100000.00, version BIGINT (@Version).
stocks (market): stock_id BIGINT PK auto, ticker_symbol VARCHAR(10) unique not null, company_name VARCHAR(100) not null, current_price DECIMAL(10,2) not null.
price_history (market): id BIGINT PK auto, ticker_symbol VARCHAR(10) not null, price DECIMAL(10,2) not null, recorded_at TIMESTAMP not null. Written by the price simulator each tick; pruned to roughly the last 2 hours.
transactions (portfolio): transaction_id BIGINT PK auto, user_id BIGINT not null, ticker_symbol VARCHAR(10) not null, transaction_type VARCHAR(4) not null (BUY|SELL, @Enumerated STRING), quantity INT not null, execution_price DECIMAL(10,2) not null, executed_at TIMESTAMP not null (Java field timestamp, @Column(name="executed_at")).
portfolios (portfolio): portfolio_id BIGINT PK auto, user_id BIGINT not null, ticker_symbol VARCHAR(10) not null, total_quantity INT not null, average_buy_price DECIMAL(10,2) not null, unique constraint (user_id, ticker_symbol).
No @ManyToOne across services. Only plain id and ticker columns.
Portfolio value over time is sampled client-side (localStorage); there is no portfolio snapshot table or API.

## 4.5 API contracts
All errors: {"error":"message"}.

### user-wallet-service (8081)
POST /api/users/register  {username,password} -> 201 {userId,username,walletBalance}; 409 if username exists; 400 if blank (username 3-50 chars, password 4+).
POST /api/users/login  {username,password} -> 200 {userId,username,walletBalance}; 401 bad credentials.
GET  /api/users/{id}/balance -> 200 {userId,walletBalance}; 404.
POST /api/users/{id}/debit?amount=X -> 200 {userId,walletBalance}; 400 insufficient funds or amount <= 0; 404.
POST /api/users/{id}/credit?amount=X -> 200 {userId,walletBalance}; 400 amount <= 0; 404.
Debit and credit are @Transactional. @Version gives optimistic locking; on ObjectOptimisticLockingFailureException retry up to 3 times, then return 409.

### stock-market-service (8082)
GET /api/stocks -> 200 [{tickerSymbol,companyName,currentPrice}]
GET /api/stocks/{tickerSymbol} -> 200 {tickerSymbol,currentPrice}; 404. Ticker is case-insensitive (uppercase before lookup).
GET /api/stocks/{tickerSymbol}/history?limit=500 -> 200 [{price,recordedAt}] newest first (or chronological — either is fine if documented in the DTO); ticker case-insensitive; default and max limit 500; 404 if ticker unknown. Backed by price_history. The simulator inserts one row per stock each 5s tick and deletes rows older than about 2 hours.
Simulator: @Scheduled(fixedRate = 5000) in a @Component; @EnableScheduling on the main class. For each stock: delta random in [-0.02, 0.02]; newPrice = max(1.00, price x (1 + delta)) at scale 2 HALF_UP; save in one transaction. Use ThreadLocalRandom.
Seed (CommandLineRunner, only if empty): AAPL Apple Inc. 190.00; MSFT Microsoft Corp. 420.00; NVDA NVIDIA Corp. 880.00; TSLA Tesla Inc. 175.00; AMZN Amazon.com Inc. 180.00; GOOGL Alphabet Inc. 150.00; META Meta Platforms Inc. 480.00; NFLX Netflix Inc. 610.00; AMD Advanced Micro Devices 160.00; INTC Intel Corp. 35.00.

### trading-portfolio-service (8083)
POST /api/trade/buy   {userId,tickerSymbol,quantity} -> 200 {transactionId,status:"SUCCESS",executionPrice}
POST /api/trade/sell  same request and response.
GET  /api/trade/history/{userId} -> 200 [{transactionId,tickerSymbol,transactionType,quantity,executionPrice,timestamp}] newest first.
GET  /api/portfolio/{userId} -> 200 [{tickerSymbol,totalQuantity,averageBuyPrice,currentMarketPrice,profitLoss}]; currentMarketPrice is fetched live from market service per ticker (one call per holding; fall back to GET /api/stocks and match if you prefer a single call).
Status codes: 400 invalid quantity / insufficient funds / insufficient holdings; 404 unknown user or ticker; 503 a downstream service is unreachable or timed out.

## 4.6 Trade flows
BUY
1. Validate request. GET market /api/stocks/{ticker} -> price. cost = price x quantity.
2. POST wallet /api/users/{id}/debit?amount=cost. Non-200 -> map the error and stop (nothing local written).
3. Call TradeRecorder.recordBuy(...) in try/catch. It is a separate @Service with @Transactional: insert transaction, then upsert portfolio (weighted average).
4. If step 3 throws, call wallet credit with the same cost (compensation), log it, return 500 with {"error":"Trade failed, funds refunded"}. If the refund also fails, log at ERROR with userId and amount.
5. Return receipt.
SELL
1. Validate. Fetch price.
2. Check the user holds at least quantity (else 400).
3. Inside one @Transactional method: insert transaction, reduce portfolio (delete row at 0), then call wallet credit LAST. If credit fails the exception rolls back the local changes.
4. Return receipt.

## 4.7 Downstream client rules
One ApiClient class per downstream service using RestTemplate built with RestTemplateBuilder (connect 2s, read 5s). Catch HttpClientErrorException and convert to domain exceptions that preserve status; catch ResourceAccessException and convert to 503.

## 4.8 UI (tradepulse-ui) — legacy fallback
Pages (Facelets .xhtml with a shared template layout.xhtml and PrimeFaces):
- login.xhtml, register.xhtml
- market.xhtml: p:dataTable of stocks inside a p:outputPanel, refreshed by <p:poll interval="5" update="stockPanel" />; Buy and Sell buttons open a p:dialog with a quantity spinner.
- portfolio.xhtml: holdings table with colored profit/loss (green / red) and total P/L footer.
- history.xhtml: transaction table.
Beans: UserSession (@Named @SessionScoped, holds userId, username, balance; refreshBalance()), MarketBean, TradeBean, PortfolioBean, HistoryBean (@Named @ViewScoped; use jakarta.faces.view.ViewScoped), AuthBean.
Clients: ApiClient (@ApplicationScoped) wrapping HttpClient + ObjectMapper, one small class per backend. Map JSON to local view-model records. Show errors with p:growl using the {"error"} message.
Auth guard: a servlet Filter redirects to login.xhtml when UserSession has no userId (approved spec amendment: guests may view the public market; only portfolio.xhtml and history.xhtml require authentication; unauthenticated guest access is permitted for /, market.xhtml, login.xhtml, register.xhtml, and paths containing jakarta.faces.resource without creating an unnecessary HTTP session).
Header shows username and balance on every page, with Logout.
No domain logic in beans beyond input shaping.
This JSF pack is retained as a fallback only. Do not edit it; new UI work goes in tradepulse-web (§4.11).

## 4.9 Tests (keep it light)
Market: unit test for the price step (floor 1.00 and bounds). Wallet: debit insufficient funds, credit, and register duplicate. Portfolio: buy flow success, buy refund-on-failure, and weighted average. Use Mockito or MockRestServiceServer. Do not write UI tests.

## 4.10 Run order and README
Preferred start order: market (8082), wallet (8081), portfolio (8083), tradepulse-web (`npm run dev` on port 3000). Optional fallback: tradepulse-ui on Tomcat (8080). README must list the commands, ports, demo login and H2 console URLs (http://localhost:808x/h2-console).

## 4.11 Web frontend (tradepulse-web)
tradepulse-web is the primary UI. Stack: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui. Runs on port 3000.
It has no DB driver, no JPA, and no business logic; it only calls REST and renders.
Proxying (next.config.js `rewrites`, no Spring CORS required):
- `/api/users/:path*` -> `http://localhost:8081/api/users/:path*`
- `/api/stocks/:path*` -> `http://localhost:8082/api/stocks/:path*`
- `/api/trade/:path*` -> `http://localhost:8083/api/trade/:path*`
- `/api/portfolio/:path*` -> `http://localhost:8083/api/portfolio/:path*`
tradepulse-ui (JSF, §4.8) is retained as a fallback and must not be edited.
