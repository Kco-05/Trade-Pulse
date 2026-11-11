"use client";

import { ArrowDownRight, ArrowUpRight, Activity } from "lucide-react";

import type { MarketSummary as MarketSummaryData } from "@/hooks/use-stock-market-state";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MarketSummaryProps = {
  summary: MarketSummaryData;
};

function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function MarketSummaryCards({ summary }: MarketSummaryProps) {
  const { topGainer, topLoser, mood, gainerCount, loserCount } = summary;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Card className="bg-zinc-900/50 ring-zinc-800">
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-1.5">
            <ArrowUpRight className="size-3.5 text-emerald-400" />
            Top Gainer
          </CardDescription>
          <CardTitle className="text-lg">
            {topGainer ? topGainer.tickerSymbol : "—"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topGainer ? (
            <div className="space-y-0.5">
              <p className="tabular-nums text-foreground">
                {formatCurrency(topGainer.currentPrice)}
              </p>
              <p className="tabular-nums text-sm text-emerald-400">
                {formatPercent(topGainer.changePercent)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Waiting for ticks…</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/50 ring-zinc-800">
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-1.5">
            <ArrowDownRight className="size-3.5 text-rose-500" />
            Top Loser
          </CardDescription>
          <CardTitle className="text-lg">
            {topLoser ? topLoser.tickerSymbol : "—"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topLoser ? (
            <div className="space-y-0.5">
              <p className="tabular-nums text-foreground">
                {formatCurrency(topLoser.currentPrice)}
              </p>
              <p className="tabular-nums text-sm text-rose-500">
                {formatPercent(topLoser.changePercent)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Waiting for ticks…</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/50 ring-zinc-800">
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-1.5">
            <Activity className="size-3.5 text-zinc-400" />
            Market Mood
          </CardDescription>
          <CardTitle
            className={cn(
              "text-lg capitalize",
              mood === "bullish" && "text-emerald-400",
              mood === "bearish" && "text-rose-500",
              mood === "mixed" && "text-foreground",
              mood === "waiting" && "text-muted-foreground",
            )}
          >
            {mood === "waiting" ? "—" : mood}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mood === "waiting" ? (
            <p className="text-sm text-muted-foreground">Waiting for ticks…</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              <span className="text-emerald-400 tabular-nums">{gainerCount}</span>{" "}
              up ·{" "}
              <span className="text-rose-500 tabular-nums">{loserCount}</span>{" "}
              down
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
