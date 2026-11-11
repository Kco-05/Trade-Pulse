"use client";

import NumberFlow from "@number-flow/react";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import type { HoldingRow } from "@/lib/portfolio-metrics";
import { cn } from "@/lib/utils";

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

function CurrencyFlow({ value }: { value: number }) {
  return (
    <NumberFlow
      value={value}
      locales="en-US"
      format={{
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }}
      className="tabular-nums text-foreground"
    />
  );
}

export function createHoldingsColumns(): ColumnDef<HoldingRow>[] {
  return [
    {
      accessorKey: "tickerSymbol",
      header: "Ticker",
      cell: ({ row }) => {
        const ticker = row.original.tickerSymbol;
        return (
          <div className="flex items-center gap-2.5">
            <Avatar size="sm" className="bg-emerald-400/10">
              <AvatarFallback className="bg-emerald-400/10 text-emerald-400">
                {ticker.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <p className="font-medium text-foreground">{ticker}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "shares",
      header: "Shares",
      cell: ({ row }) => (
        <span className="tabular-nums text-foreground">
          {row.original.shares}
        </span>
      ),
    },
    {
      accessorKey: "livePrice",
      header: "Live Price",
      cell: ({ row }) => <CurrencyFlow value={row.original.livePrice} />,
    },
    {
      accessorKey: "totalValue",
      header: "Total Value",
      cell: ({ row }) => <CurrencyFlow value={row.original.totalValue} />,
    },
    {
      id: "profitLoss",
      accessorKey: "profitLoss",
      header: "P/L",
      cell: ({ row }) => {
        const { profitLoss, profitLossPercent, livePrice, averageBuyPrice } =
          row.original;
        const up = livePrice > averageBuyPrice;
        const down = livePrice < averageBuyPrice;

        return (
          <div
            className={cn(
              "space-y-0.5 tabular-nums",
              up && "text-emerald-400",
              down && "text-rose-500",
              !up && !down && "text-zinc-400",
            )}
          >
            <p className="font-medium">{formatSignedCurrency(profitLoss)}</p>
            <p className="text-xs opacity-90">
              {formatSignedPercent(profitLossPercent)}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "allocationPercent",
      header: "Allocation",
      cell: ({ row }) => {
        const pct = row.original.allocationPercent;
        return (
          <div className="min-w-28 space-y-1">
            <Progress value={pct} className="gap-0" />
            <p className="text-xs tabular-nums text-muted-foreground">
              {pct.toFixed(1)}%
            </p>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const ticker = row.original.tickerSymbol;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${ticker} actions`}
                />
              }
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                render={<Link href={`/?ticker=${encodeURIComponent(ticker)}&side=buy`} />}
              >
                Buy more
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<Link href={`/?ticker=${encodeURIComponent(ticker)}&side=sell`} />}
              >
                Sell
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<Link href={`/?ticker=${encodeURIComponent(ticker)}`} />}
              >
                View chart
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
    },
  ];
}
