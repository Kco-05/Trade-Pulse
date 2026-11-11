"use client";

import NumberFlow from "@number-flow/react";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import type { CSSProperties } from "react";

import { Sparkline } from "@/components/market/sparkline";
import { WatchlistButton } from "@/components/market/watchlist-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MarketRow } from "@/hooks/use-stock-market-state";
import { cn } from "@/lib/utils";

export type MarketColumnMeta = {
  toggleWatchlist: (ticker: string) => void;
  isWatched: (ticker: string) => boolean;
};

function formatSignedCurrency(value: number): string {
  const abs = Math.abs(value).toFixed(2);
  if (value > 0) return `+$${abs}`;
  if (value < 0) return `-$${abs}`;
  return `$${abs}`;
}

function formatSignedPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function createMarketColumns(
  meta: MarketColumnMeta,
): ColumnDef<MarketRow>[] {
  return [
    {
      id: "watch",
      header: () => <span className="sr-only">Watchlist</span>,
      cell: ({ row }) => (
        <WatchlistButton
          ticker={row.original.tickerSymbol}
          starred={meta.isWatched(row.original.tickerSymbol)}
          onToggle={meta.toggleWatchlist}
        />
      ),
      enableSorting: false,
      size: 40,
    },
    {
      accessorKey: "tickerSymbol",
      header: ({ column }) => (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="-ml-2 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Symbol
        </Button>
      ),
      cell: ({ row }) => {
        const { tickerSymbol, companyName } = row.original;
        return (
          <div className="flex items-center gap-2.5">
            <Avatar size="sm" className="bg-emerald-400/10">
              <AvatarFallback className="bg-emerald-400/10 text-emerald-400">
                {tickerSymbol.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium text-foreground">{tickerSymbol}</p>
              <p className="truncate text-xs text-muted-foreground">
                {companyName}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "currentPrice",
      header: ({ column }) => (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="-ml-2 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
        </Button>
      ),
      cell: ({ row }) => (
        // Fixed box so NumberFlow's digit-width tween cannot widen the table
        // (which would flash the overflow-x scrollbar every 5s tick).
        <span
          className="inline-flex w-[8.5ch] justify-end overflow-hidden tabular-nums"
          style={
            {
              "--number-flow-mask-width": "0.15em",
            } as CSSProperties
          }
        >
          <NumberFlow
            value={row.original.currentPrice}
            locales="en-US"
            format={{
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }}
            className="tabular-nums text-foreground"
            style={{ fontVariantNumeric: "tabular-nums" }}
          />
        </span>
      ),
    },
    {
      accessorKey: "changePercent",
      header: ({ column }) => (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="-ml-2 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Change
        </Button>
      ),
      cell: ({ row }) => {
        const { change, changePercent, hasPriorTick } = row.original;
        if (!hasPriorTick) {
          return (
            <Badge
              variant="outline"
              className="gap-1 border-zinc-700 text-zinc-400"
            >
              <Minus data-icon="inline-start" />
              —
            </Badge>
          );
        }

        const up = change > 0;
        const down = change < 0;
        const Icon = up ? ArrowUp : down ? ArrowDown : Minus;

        return (
          <Badge
            variant="outline"
            className={cn(
              "max-w-[12.5rem] gap-1 truncate tabular-nums",
              up &&
                "border-emerald-400/30 bg-emerald-400/10 text-emerald-400",
              down && "border-rose-500/30 bg-rose-500/10 text-rose-500",
              !up && !down && "border-zinc-700 text-zinc-400",
            )}
          >
            <Icon data-icon="inline-start" />
            {formatSignedCurrency(change)} ({formatSignedPercent(changePercent)})
          </Badge>
        );
      },
    },
    {
      id: "trend",
      header: "Trend",
      cell: ({ row }) => (
        <div className="w-[100px] overflow-hidden">
          <Sparkline history={row.original.history} />
        </div>
      ),
      enableSorting: false,
      size: 116,
    },
  ];
}
