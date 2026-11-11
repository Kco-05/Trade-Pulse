# TradePulse – UI Component Roadmap

Build the frontend with Next.js (App Router), Tailwind and shadcn/ui as the base, Magic UI and Aceternity UI for the landing page, Tremor for KPI cards, TradingView Lightweight Charts for price charts, and Recharts (through shadcn's Chart wrapper) for analytics. Component names below are the ones to search for; these registries change often, so confirm each name and install command on its site before pasting code into Cursor.

## 0. Read first: decisions and backend gaps

Four small gaps will block the UI if you ignore them. Only the first needs no backend change.

| Gap | Why it matters | Fix |
| --- | --- | --- |
| CORS | The browser cannot call ports 8081-8083 from localhost:3000 without CORS config. | Use `rewrites()` in `next.config.js`: `/api/users/:path*` to 8081, `/api/stocks/:path*` to 8082, `/api/trade/:path*` and `/api/portfolio/:path*` to 8083. No Spring changes needed. |
| No price history | Candlesticks and sparklines need past prices; the market service only stores the current one. | Add `GET /api/stocks/{ticker}/history?limit=500`, backed by a `price_history` table (ticker, price, recorded\_at) written by the scheduler and pruned to the last \~2 hours. This is the one backend addition I recommend. Without it, charts start empty on every page load. |
| No portfolio value over time | The P/L-over-time chart has nothing to plot. | Easiest: the UI samples net worth on each 5-second poll and keeps it in `localStorage` per user. Cleaner: a small snapshot table in the portfolio service. |
| No tokens | Login returns only `userId`. | After login, set an httpOnly cookie (`tp_uid`) from a Next.js route handler, and guard `/portfolio` and `/history` in `middleware.ts`. Say in your report that auth is simplified. |

Two more notes. Your original lab spec says the UI is JSF, so check that your rubric allows a React frontend; the JSF pack stays as your fallback. And keep the polish honest: add a small "Simulated market, virtual funds" badge, and derive every number from real endpoints (net worth, allocation, P/L, history). Do not invent fake users, news or trading volume. It looks premium, and it survives an examiner reading the code.

### Shared foundations

| Need | Pick |
| --- | --- |
| Theme | Tailwind `zinc-950` page, cards `bg-zinc-900/50` with `border-zinc-800`, gain `emerald-400`, loss `rose-500`, muted text `zinc-400` |
| Type | Geist or Inter, and `tabular-nums` on every price so digits do not jitter |
| Data fetching | TanStack Query with `refetchInterval: 5000`, matching the backend tick |
| Session state | Zustand (`userId`, `username`) |
| Animated numbers | NumberFlow (`@number-flow/react`) for prices, balances and P/L |
| Animation | Motion (formerly Framer Motion) |
| Forms | react-hook-form + zod, through shadcn `Form` |
| Toasts | shadcn `Sonner` |
| Icons, dates | lucide-react, date-fns |

## 1. Phase 1: App shell and design system

| Slot | Component | Library | Note |
| --- | --- | --- | --- |
| Logged-in layout | `Sidebar` (start from the `dashboard-01` block) | shadcn/ui | Collapsible on mobile |
| Top bar | `Breadcrumb`, `Avatar`, `DropdownMenu` | shadcn/ui | Show wallet balance next to the avatar |
| Stock search | `Command` (cmdk) as a Cmd+K palette | shadcn/ui | Jump to any ticker |
| Loading | `Skeleton` | shadcn/ui | One skeleton per card and table |
| Errors | `Alert`, `Sonner` | shadcn/ui | A 503 from a service shows a banner, not a stack trace |
| Tooltips and badges | `Tooltip`, `Badge` | shadcn/ui |  |

## 2. Phase 2: Landing page (build last, see section 7)

Use at most two heavy background effects on the page, or it will lag and look noisy.

| Section | Component | Library | Why |
| --- | --- | --- | --- |
| Navbar | `Floating Navbar` (or `Resizable Navbar`) | Aceternity UI | Glassy, shrinks on scroll |
| Nav CTA | `Shimmer Button` | Magic UI | Emerald glow |
| Hero background | `Spotlight` (with `Background Beams`) | Aceternity UI | Alternatives: `Grid Pattern`, `Dot Pattern` or `Retro Grid` (Magic UI) for a cleaner look |
| Hero badge | `Animated Shiny Text` | Magic UI | Pill reading "Live simulated market" |
| Headline | `Text Generate Effect` or `Flip Words` | Aceternity UI | Rotate words like "Trade. Track. Learn." |
| Hero visual | `Container Scroll Animation` with a dashboard screenshot | Aceternity UI | The tilted-card reveal is the "expensive" moment. Alternative: Magic UI `Safari` mockup with `Border Beam` |
| Ticker marquee | `Marquee` | Magic UI | Feed it from `/api/stocks`, with colored arrows and NumberFlow. Alternative: `Infinite Moving Cards` |
| Stats strip | `Number Ticker` | Magic UI | Only true facts: $100,000 start, 10 tickers, 5-second updates |
| Feature bento | `Bento Grid` | Magic UI (or Aceternity) | Fill cells with a mini live chart, an `Animated List` of sample trades, and a `Marquee` |
| Architecture cell | `Animated Beam` | Magic UI | Draw UI to wallet, market and portfolio services. Honest, and it shows off the microservices |
| Card hover | `Card Spotlight` or `Glowing Effect` | Aceternity UI | On bento cells |
| How it works | `Timeline` or `Sticky Scroll Reveal` | Aceternity UI | Three steps: sign up, pick a stock, track P/L |
| Section entrance | `Blur Fade` | Magic UI | Staggered reveal |
| Final CTA | `Background Beams With Collision` or `Ripple` | Aceternity UI / Magic UI | One last push to sign up |
| Footer | plain shadcn `Separator` + links | shadcn/ui |  |

## 3. Phase 3: Authentication

| Slot | Component | Library | Note |
| --- | --- | --- | --- |
| Card layout | `login-02` / `login-04` and `signup-01` blocks | shadcn/ui blocks | Split layout with a branded side panel works well |
| Card chrome | `Card` + `Border Beam` | shadcn/ui + Magic UI | Subtle animated border on the form card |
| Page backdrop | `Background Beams` or `Dot Pattern` | Aceternity / Magic UI | Reuse the landing effect |
| Login vs sign up | `Tabs` in one card | shadcn/ui | Avoids a page reload feel |
| Fields | `Form`, `Input`, `Label` with eye toggle | shadcn/ui | zod: username 3-50, password 4+ to match the backend |
| Password strength | `Progress` | shadcn/ui | Cosmetic hint only |
| Submit | `Button` with spinner (or `Shimmer Button`) | shadcn/ui / Magic UI | Disable while pending |
| Errors | `Alert` or `Sonner` | shadcn/ui | Map 401 to "Invalid credentials" and 409 to "Username taken" |
| Demo shortcut | Ghost `Button`: "Use demo account" | shadcn/ui | Fills `demo` / `demo123` |

## 4. Phase 4: Live market dashboard (public)

### 4.1 Stock list

| Slot | Component | Library | Note |
| --- | --- | --- | --- |
| Table | `Data Table` (TanStack Table) | shadcn/ui | Sorting, filtering, column visibility. Heavier alternative: AG Grid Community with `enableCellChangeFlash` |
| Symbol cell | `Avatar` (ticker letter) + company name | shadcn/ui |  |
| Price cell | `NumberFlow` | NumberFlow | Digits roll on each tick |
| Change cell | `Badge` with arrow, emerald or rose | shadcn/ui + lucide | Compare to the previous tick, or to the price 1 hour ago once the history endpoint exists |
| Mini trend | `SparkAreaChart` or Recharts `LineChart` (no axes) | Tremor / Recharts | Last \~60 ticks per row |
| Row flash | Custom CSS keyframe or Motion `animate` | Motion | Brief green or red background when the price changes |
| Filters | `Input` search + `ToggleGroup` (All, Gainers, Losers, Watchlist) | shadcn/ui | Watchlist is a local star toggle |
| Alternate view | `Tabs`: List or Heatmap; heatmap = Recharts `Treemap` colored by change | shadcn/ui + Recharts | Cheap, impressive "market map" |
| Summary row | Three small `Card`s: Top Gainer, Top Loser, Market Mood | shadcn/ui | Computed from the same data |

### 4.2 Price chart

Use **TradingView Lightweight Charts** (`lightweight-charts`). It is the right tool for price data: fast, small, and made for streaming updates. Check which major version you install, because the API changed: v5 uses `chart.addSeries(CandlestickSeries, ...)`, v4 uses `chart.addCandlestickSeries(...)`.

| Feature | Use | Note |
| --- | --- | --- |
| Default view | `AreaSeries` with gradient top and bottom colors | Emerald when up over the range, rose when down |
| Candles | `CandlestickSeries` | Toggle with a shadcn `ToggleGroup` (Line, Candles) |
| Timeframes | `ToggleGroup`: 1m, 5m, 15m | Aggregate 5-second ticks into OHLC candles on the client (12 ticks make one 1-minute candle) |
| Live ticks | `series.update()` | Call on every poll; never recreate the chart |
| Your cost basis | `createPriceLine` at your average buy price | Real data from `/api/portfolio/{id}` |
| Trade markers | Series markers (`createSeriesMarkers` in v5, `setMarkers` in v4) | Arrows at your own buys and sells from the history endpoint |
| Hover legend | shadcn `Card` overlay driven by the crosshair move event | Shows O/H/L/C or price at the cursor |

In Next.js, load the chart wrapper with `dynamic(() => import(...), { ssr: false })`. Create the chart in a `useEffect`, and call `chart.remove()` on cleanup. Skip a volume pane; the backend has no volume data.

### 4.3 Buy/Sell execution slip

| Slot | Component | Library | Note |
| --- | --- | --- | --- |
| Container | `Card` in a right-hand column; `Drawer` (Vaul) on mobile | shadcn/ui | One component, two shells |
| Side switch | `Tabs` (Buy, Sell) | shadcn/ui | Active tab emerald for Buy, rose for Sell |
| Quantity | `Input` with +/- buttons, plus `Slider` | shadcn/ui | Range 1 to 10000, integers only |
| Quick sizes | `ToggleGroup` (25%, 50%, 75%, Max) | shadcn/ui | Max buy = floor(balance / price); max sell = shares held |
| Order summary | Rows with `NumberFlow` | NumberFlow | Price, quantity, estimated cost, cash available, cash after |
| Submit | `Shimmer Button` (Buy) and a rose `Button` (Sell) | Magic UI / shadcn | Disable while pending |
| Confirm | `AlertDialog` | shadcn/ui | "Buy 10 AAPL for about $1,902.50?" |
| Receipt | `Sonner` toast with transaction id | shadcn/ui | Optional subtle `Confetti` on a successful buy |
| Logged-out state | Blurred card (`backdrop-blur`) with "Log in to trade" `Button` and `Border Beam` | shadcn + Magic UI | The market stays visible; only the slip is locked |
| Validation | Inline text under the input | shadcn `Form` | Mirror backend rules: insufficient funds (400), oversell (400) |

## 5. Phase 5: Portfolio and analytics (protected)

### 5.1 KPI cards

| Card | Component | Value |
| --- | --- | --- |
| Net Worth | shadcn `Card` + `NumberFlow` + `Magic Card` or `Neon Gradient Card` hover glow | wallet balance + sum(quantity x current price) |
| Cash Balance | Tremor KPI block (`Card`, `Metric`) | from `/balance` |
| Holdings Value | Tremor KPI block | sum(quantity x current price) |
| Total P/L | Tremor `BadgeDelta` + `NumberFlow` | sum of `profitLoss`, plus percent vs cost basis |

Tremor's copy-paste KPI card blocks (blocks.tremor.so) are the fastest route; swap their colors to your emerald and rose tokens. Each card gets a tiny `SparkAreaChart` of the last session.

### 5.2 Charts

| Chart | Component | Note |
| --- | --- | --- |
| P/L over time (best) | Lightweight Charts `BaselineSeries` with baseline at 100,000 | Green above, red below the start: the classic net-worth view |
| P/L over time (simpler) | shadcn `Chart` (`ChartContainer`, `ChartTooltip`) over a Recharts `AreaChart` with a `linearGradient` fill | Matches the shadcn theme exactly |
| Range selector | `ToggleGroup` (Session, 1H, All) |  |
| Allocation | Tremor `DonutChart` or shadcn `Chart` pie-donut | Net worth in the center; legend by ticker |
| Cash vs invested | Tremor `CategoryBar` | One slim bar |
| Best / worst holding | Two `Card`s with `BadgeDelta` | From `profitLoss` per row |

### 5.3 Tables

| Table | Component | Conditional formatting |
| --- | --- | --- |
| Holdings | shadcn `Data Table` | P/L text `text-emerald-400` or `text-rose-500`, plus a pill `bg-emerald-500/10`; allocation weight as a thin `Progress` bar; live price via `NumberFlow` |
| Holdings actions | `DropdownMenu` per row (Buy more, Sell, View chart) | Opens the execution slip with the ticker prefilled |
| Holdings footer | Totals row | Total value and total P/L |
| History | shadcn `Data Table` with `DataTablePagination` | BUY badge emerald, SELL badge rose |
| History time | `date-fns` relative time with a `Tooltip` showing the full timestamp |  |
| History filters | `Tabs` (All, Buy, Sell) and a `Select` for ticker |  |
| Empty states | A `Card` with an icon and a "Make your first trade" `Button` |  |

## 6. Phase 6: Polish

- **Motion:** `AnimatePresence` and `layout` for rows entering and leaving, `Blur Fade` on page load.
- **States:** every card and table has a `Skeleton`, an empty state, and an error state.
- **Accessibility:** respect `prefers-reduced-motion`; never use color alone for gain and loss, keep the arrow and the +/- sign.
- **Performance:** memoize table rows, update only cells whose price changed, keep one chart instance per page, and avoid stacking blur and glow effects.
- **Keyboard:** Cmd+K palette, Escape closes the slip.

## 7. Build order (one Cursor chat each)

Build real pages first and marketing last; a landing page on top of a broken app is wasted effort.

1. Setup: Next.js, Tailwind, shadcn, theme tokens, the proxy `rewrites`, a typed API client, TanStack Query hooks (`useStocks`, `usePortfolio`, `useBalance`).
2. Auth and session: login, sign up, cookie, middleware, app shell.
3. Market table: Data Table, NumberFlow prices, flash, filters.
4. Backend addition: the history endpoint, then the Lightweight Charts component.
5. Execution slip, including the locked state and all validations.
6. Portfolio: KPI cards, charts, holdings and history tables.
7. Landing page.
8. Phase 6 polish, then a final run against the real backend.

## 8. Cursor guardrails and prompt template

Add a frontend section to `AGENTS.md`:

```markdown
## Frontend rules
- Next.js App Router, TypeScript, Tailwind, shadcn/ui only for primitives.
- Colors: zinc-950 background, emerald-400 gain, rose-500 loss. Do not introduce other accent colors.
- All prices use tabular-nums and the shared formatCurrency helper. Never use floating-point math for display logic beyond formatting.
- No mock data in components. Data comes only from the hooks in /lib/api.
- Do not add a new dependency without asking.
- Keep animations to the ones listed in the plan. Respect prefers-reduced-motion.
```

Prompt template for each pasted component:

```
I am pasting the code for <Component> from <Library>. Adapt it for TradePulse Phase <N>, section <name>.
Retheme it to our tokens (zinc-950, emerald-400, rose-500). Wire it to <hook>. Keep our file structure.
Do not add libraries beyond what is already installed. Show the files you changed.
```

A pasted Magic UI or Aceternity component often brings its own dependencies (`motion`, `clsx`, `tailwind-merge`) and a few Tailwind keyframes. Let Cursor merge those into `tailwind.config` rather than pasting over it.
