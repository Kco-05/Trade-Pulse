"use client";

import { useMemo, useState } from "react";

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
    </div>
  );
}

export default function MarketPage() {
  const { data, isLoading, isError, error } = useStocks();
  const rows = useStockMarketState(data);
  const { toggle, has } = useWatchlist();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<MarketFilter>("all");

  const summary = useMemo(() => computeMarketSummary(rows), [rows]);

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
          <MarketTable
            rows={filteredRows}
            toggleWatchlist={toggle}
            isWatched={has}
          />
        </>
      )}
    </div>
  );
}
