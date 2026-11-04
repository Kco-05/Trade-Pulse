# TradePulse – Requirements

## Goal
A virtual stock trading simulator. Users get $100,000 virtual cash, see simulated live prices, buy and sell stocks and track portfolio profit/loss.

## Functional requirements
FR-1 Register with unique username and password (BCrypt hashed). New users start with 100000.00.
FR-2 Login with username and password. Failure returns a clear error.
FR-3 View current wallet balance at any time.
FR-4 View a list of at least 8 stocks with live prices that change every 5 seconds (random -2% to +2%, floor 1.00).
FR-5 Buy a quantity of a stock at the current market price. Rejected if funds are insufficient or quantity invalid.
FR-6 Sell a quantity of a stock the user owns. Rejected if the user owns fewer shares.
FR-7 View portfolio: ticker, quantity, average buy price, current market price, profit/loss.
FR-8 View transaction history (newest first).
FR-9 Market page auto-refreshes prices every 5 seconds without a full page reload.

## Business rules
BR-1 Total cost = price x quantity, rounded HALF_UP to 2 decimals.
BR-2 Buy: average_buy_price = weighted average of old holding and new purchase.
BR-3 Sell: average_buy_price is unchanged. Delete the portfolio row when quantity reaches 0.
BR-4 profitLoss = (currentMarketPrice - averageBuyPrice) x totalQuantity.
BR-5 Quantity must be an integer from 1 to 10000.
BR-6 One portfolio row per (user_id, ticker_symbol).
BR-7 The wallet balance can never go negative, even with simultaneous requests.
BR-8 Money must not be lost: if a buy fails after the wallet was debited, the wallet is refunded.

## Non-functional requirements
NFR-1 Each service has its own H2 file DB; data survives restart.
NFR-2 Downstream timeouts: connect 2s, read 5s. A downed dependency yields HTTP 503.
NFR-3 Seed data: 10 stocks and one demo user (demo / demo123) loaded only when tables are empty.
NFR-4 Passwords never logged or returned.
NFR-5 Each service starts independently with `mvn spring-boot:run`.
NFR-6 Auth is simplified (userId is sent by the client). This is a documented limitation, not a bug.

## Out of scope
Spring Security, JWT, real market data, limit orders, shorting, margin, charts beyond one optional price column, Docker, cloud deployment.