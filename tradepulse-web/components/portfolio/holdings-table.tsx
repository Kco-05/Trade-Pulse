"use client";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { EmptyTradeCta } from "@/components/portfolio/empty-trade-cta";
import { createHoldingsColumns } from "@/components/portfolio/holdings-columns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  sumMoney,
  type HoldingRow,
} from "@/lib/portfolio-metrics";
import { cn } from "@/lib/utils";

type HoldingsTableProps = {
  rows: HoldingRow[];
  isLoading?: boolean;
};

export function HoldingsTable({ rows, isLoading }: HoldingsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "tickerSymbol", desc: false },
  ]);

  const columns = useMemo(() => createHoldingsColumns(), []);

  // TanStack Table returns unstable function identities; React Compiler skips this component.
  // eslint-disable-next-line react-hooks/incompatible-library -- expected with useReactTable
  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.tickerSymbol,
  });

  if (isLoading) {
    return <Skeleton className="h-64 rounded-xl" />;
  }

  if (rows.length === 0) {
    return (
      <EmptyTradeCta
        title="No holdings yet"
        description="Buy a stock on the market to start building your portfolio."
      />
    );
  }

  const totalValue = sumMoney(rows.map((row) => row.totalValue));
  const totalPl = sumMoney(rows.map((row) => row.profitLoss));
  const plUp = totalPl > 0;
  const plDown = totalPl < 0;

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-zinc-800 hover:bg-transparent"
            >
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-zinc-400">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="border-zinc-800">
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="border-zinc-800 bg-zinc-900/80 hover:bg-zinc-900/80">
            <TableCell colSpan={3} className="font-medium text-zinc-400">
              Totals
            </TableCell>
            <TableCell className="tabular-nums font-medium text-foreground">
              {formatCurrency(totalValue)}
            </TableCell>
            <TableCell
              className={cn(
                "tabular-nums font-medium",
                plUp && "text-emerald-400",
                plDown && "text-rose-500",
                !plUp && !plDown && "text-foreground",
              )}
            >
              {totalPl > 0 ? "+" : ""}
              {formatCurrency(totalPl)}
            </TableCell>
            <TableCell colSpan={2} />
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
