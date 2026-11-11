"use client";

import { useMemo } from "react";

import { HistoryTable } from "@/components/portfolio/history-table";
import { HoldingsTable } from "@/components/portfolio/holdings-table";
import { KpiCards, KpiCardsSkeleton } from "@/components/portfolio/kpi-cards";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBalance,
  useHistory,
  usePortfolio,
  useStocks,
} from "@/lib/api";
import {
  buildHoldingRows,
  buildPriceMap,
  computePortfolioKpis,
} from "@/lib/portfolio-metrics";
import { useSessionStore } from "@/lib/stores/session";

export default function PortfolioPage() {
  const userId = useSessionStore((s) => s.userId);

  const balanceQuery = useBalance(userId);
  const portfolioQuery = usePortfolio(userId);
  const historyQuery = useHistory(userId);
  const stocksQuery = useStocks();

  const priceByTicker = useMemo(
    () => buildPriceMap(stocksQuery.data),
    [stocksQuery.data],
  );

  const holdingRows = useMemo(
    () => buildHoldingRows(portfolioQuery.data, priceByTicker),
    [portfolioQuery.data, priceByTicker],
  );

  const kpis = useMemo(() => {
    if (balanceQuery.data == null) return null;
    return computePortfolioKpis(balanceQuery.data.walletBalance, holdingRows);
  }, [balanceQuery.data, holdingRows]);

  const kpisLoading =
    balanceQuery.isLoading ||
    portfolioQuery.isLoading ||
    (stocksQuery.isLoading && !stocksQuery.data);

  const holdingsLoading = portfolioQuery.isLoading || stocksQuery.isLoading;
  const historyLoading = historyQuery.isLoading;

  const errorMessage =
    (balanceQuery.isError &&
      (balanceQuery.error instanceof Error
        ? balanceQuery.error.message
        : "Failed to load balance")) ||
    (portfolioQuery.isError &&
      (portfolioQuery.error instanceof Error
        ? portfolioQuery.error.message
        : "Failed to load portfolio")) ||
    (historyQuery.isError &&
      (historyQuery.error instanceof Error
        ? historyQuery.error.message
        : "Failed to load history")) ||
    (stocksQuery.isError &&
      (stocksQuery.error instanceof Error
        ? stocksQuery.error.message
        : "Failed to load live prices")) ||
    null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Portfolio
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Net worth, holdings, and trade history — refreshed with the live
          market.
        </p>
      </div>

      {errorMessage ? (
        <Alert variant="destructive" className="border-rose-500/30 bg-rose-500/10">
          <AlertTitle>Could not load portfolio data</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-400">Overview</h2>
        {kpisLoading && !kpis ? (
          <KpiCardsSkeleton />
        ) : (
          <KpiCards kpis={kpis} isLoading={kpisLoading && !kpis} />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-400">Holdings</h2>
        <HoldingsTable rows={holdingRows} isLoading={holdingsLoading} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-400">Transaction history</h2>
        {historyLoading && !historyQuery.data ? (
          <Skeleton className="h-72 rounded-xl" />
        ) : (
          <HistoryTable
            rows={historyQuery.data ?? []}
            isLoading={historyLoading}
          />
        )}
      </section>
    </div>
  );
}
