"use client";

import { useStocks } from "@/lib/api";
import { formatCurrency } from "@/lib/formatCurrency";

export default function Home() {
  const { data, isLoading, isError, error } = useStocks();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          TradePulse
        </h1>
        <p className="mt-2 text-muted-foreground">
          Phase 1 foundation — API client and live stock poll via rewrites.
        </p>
      </div>

      <section className="rounded-lg border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Market (refetch every 5s)
        </h2>
        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading stocks…</p>
        )}
        {isError && (
          <p className="text-sm text-loss">
            {error instanceof Error ? error.message : "Failed to load stocks"}
          </p>
        )}
        {data && (
          <ul className="space-y-2">
            {data.map((stock) => (
              <li
                key={stock.tickerSymbol}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-medium">{stock.tickerSymbol}</span>
                <span className="tabular-nums text-gain">
                  {formatCurrency(stock.currentPrice)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
