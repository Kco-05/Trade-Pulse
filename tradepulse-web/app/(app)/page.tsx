"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

import { ExecutionSlip } from "@/components/market/execution-slip";
import { MarketFilters, type MarketFilter } from "@/components/market/market-filters";
import { MarketSummaryCards } from "@/components/market/market-summary";
import { MarketTable } from "@/components/market/market-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  computeMarketSummary,
  useStockMarketState,
} from "@/hooks/use-stock-market-state";
import { useWatchlist } from "@/hooks/use-watchlist";
import { useStocks } from "@/lib/api";

const PriceChart = dynamic(
  () =>
    import("@/components/market/price-chart").then((mod) => mod.PriceChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-80 rounded-xl" />,
  },
);

function MarketPageSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
      <Skeleton className="h-9 w-full max-w-sm rounded-lg" />
      <Skeleton className="h-72 rounded-xl" />
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}

function parseSide(value: string | null): "buy" | "sell" | undefined {
  if (value === "buy" || value === "sell") return value;
  return undefined;
}

function normalizeTicker(value: string | null): string | null {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  return normalized.length > 0 ? normalized : null;
}

function MarketPageContent() {
  const searchParams = useSearchParams();
  const urlTicker = normalizeTicker(searchParams.get("ticker"));
  const sideParam = parseSide(searchParams.get("side"));

  const { data, isLoading, isError, error, dataUpdatedAt } = useStocks();
  const rows = useStockMarketState(data);
  const { toggle, has } = useWatchlist();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<MarketFilter>("all");
  const [manualTicker, setManualTicker] = useState<string | null>(null);
  const [seenUrlTicker, setSeenUrlTicker] = useState(urlTicker);

  // When the deep-link ticker changes, prefer the URL over a prior row click.
  if (urlTicker !== seenUrlTicker) {
    setSeenUrlTicker(urlTicker);
    setManualTicker(null);
  }

  const summary = useMemo(() => computeMarketSummary(rows), [rows]);

  const activeTicker =
    manualTicker ?? urlTicker ?? data?.[0]?.tickerSymbol ?? null;

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesSearch =
        query.length === 0 ||
        row.tickerSymbol.toLowerCase().includes(query) ||
        row.companyName.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (filter === "gainers") return row.hasPriorTick && row.change > 0;
      if (filter === "losers") return row.hasPriorTick && row.change < 0;
      if (filter === "watchlist") return has(row.tickerSymbol);
      return true;
    });
  }, [rows, search, filter, has]);

  const selectedRow = useMemo(
    () => rows.find((row) => row.tickerSymbol === activeTicker) ?? null,
    [rows, activeTicker],
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Market
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Simulated market, virtual funds — prices refresh every 5 seconds.
        </p>
      </div>

      {isLoading && rows.length === 0 ? (
        <MarketPageSkeleton />
      ) : isError ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-500"
        >
          {error instanceof Error ? error.message : "Failed to load stocks"}
        </div>
      ) : (
        <>
          <MarketSummaryCards summary={summary} />
          <MarketFilters
            search={search}
            onSearchChange={setSearch}
            filter={filter}
            onFilterChange={setFilter}
          />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="flex min-w-0 flex-col gap-4">
              <MarketTable
                rows={filteredRows}
                toggleWatchlist={toggle}
                isWatched={has}
                selectedTicker={activeTicker}
                onSelectTicker={setManualTicker}
              />
              {activeTicker ? (
                <PriceChart
                  ticker={activeTicker}
                  livePrice={selectedRow?.currentPrice ?? null}
                  tickAt={dataUpdatedAt}
                />
              ) : (
                <Skeleton className="h-80 rounded-xl" />
              )}
            </div>
            <ExecutionSlip
              selectedTicker={activeTicker}
              currentPrice={selectedRow?.currentPrice ?? null}
              initialSide={sideParam}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default function MarketPage() {
  return (
    <Suspense fallback={<MarketPageSkeleton />}>
      <MarketPageContent />
    </Suspense>
  );
}
