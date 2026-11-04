# TradePulse – Known Limitations

This is a college-lab simulator. The following are deliberate design choices, not bugs.

- **Simplified auth** — There is no JWT or Spring Security. After login, the UI keeps `userId` in the session and sends it on every trade/portfolio call. Any client that knows a `userId` can call the APIs directly (NFR-6).

- **No distributed transactions** — Wallet, market, and portfolio each own a separate H2 database. There is no two-phase commit or saga framework across services.

- **Compensation only on buy** — A buy debits the wallet first, then writes the local transaction/portfolio row. If that local write fails, the portfolio service credits the wallet back (best-effort refund). A sell updates local state and credits the wallet last inside one local transaction so a failed credit rolls back the portfolio changes; there is still no cross-service atomic commit.
