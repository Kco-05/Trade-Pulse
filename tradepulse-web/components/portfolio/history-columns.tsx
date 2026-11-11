"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { format, formatDistanceToNow, parseISO } from "date-fns";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Transaction } from "@/lib/api/types";
import { formatCurrency } from "@/lib/formatCurrency";
import { multiplyMoney } from "@/lib/portfolio-metrics";
import { cn } from "@/lib/utils";

function RelativeTimestamp({ timestamp }: { timestamp: string }) {
  const date = parseISO(timestamp);
  const relative = formatDistanceToNow(date, { addSuffix: true });
  const exact = format(date, "PPpp");

  return (
    <Tooltip>
      <TooltipTrigger className="cursor-default text-left text-muted-foreground underline-offset-2 hover:underline">
        {relative}
      </TooltipTrigger>
      <TooltipContent>{exact}</TooltipContent>
    </Tooltip>
  );
}

export function createHistoryColumns(): ColumnDef<Transaction>[] {
  return [
    {
      accessorKey: "timestamp",
      header: "Date",
      cell: ({ row }) => (
        <RelativeTimestamp timestamp={row.original.timestamp} />
      ),
    },
    {
      accessorKey: "tickerSymbol",
      header: "Ticker",
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.tickerSymbol}
        </span>
      ),
    },
    {
      accessorKey: "transactionType",
      header: "Action",
      cell: ({ row }) => {
        const type = row.original.transactionType;
        const isBuy = type === "BUY";
        return (
          <Badge
            variant="outline"
            className={cn(
              "tabular-nums",
              isBuy &&
                "border-emerald-400/30 bg-emerald-400/10 text-emerald-400",
              !isBuy && "border-rose-500/30 bg-rose-500/10 text-rose-500",
            )}
          >
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "quantity",
      header: "Shares",
      cell: ({ row }) => (
        <span className="tabular-nums text-foreground">
          {row.original.quantity}
        </span>
      ),
    },
    {
      accessorKey: "executionPrice",
      header: "Price",
      cell: ({ row }) => (
        <span className="tabular-nums text-foreground">
          {formatCurrency(row.original.executionPrice)}
        </span>
      ),
    },
    {
      id: "totalAmount",
      header: "Total Amount",
      accessorFn: (row) =>
        multiplyMoney(row.quantity, row.executionPrice),
      cell: ({ row }) => (
        <span className="tabular-nums text-foreground">
          {formatCurrency(
            multiplyMoney(
              row.original.quantity,
              row.original.executionPrice,
            ),
          )}
        </span>
      ),
    },
  ];
}
