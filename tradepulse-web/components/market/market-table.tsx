"use client";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { motion } from "motion/react";
import { useMemo, useState } from "react";

import { createMarketColumns } from "@/components/market/columns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MarketRow } from "@/hooks/use-stock-market-state";
import { cn } from "@/lib/utils";

type MarketTableProps = {
  rows: MarketRow[];
  toggleWatchlist: (ticker: string) => void;
  isWatched: (ticker: string) => boolean;
  selectedTicker?: string | null;
  onSelectTicker?: (ticker: string) => void;
};

export function MarketTable({
  rows,
  toggleWatchlist,
  isWatched,
  selectedTicker,
  onSelectTicker,
}: MarketTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "tickerSymbol", desc: false },
  ]);

  const columns = useMemo(
    () => createMarketColumns({ toggleWatchlist, isWatched }),
    [toggleWatchlist, isWatched],
  );

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
          {table.getRowModel().rows.length === 0 ? (
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                No stocks match your filters.
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => {
              const flash = row.original.flash;
              const selected = selectedTicker === row.original.tickerSymbol;
              return (
                <motion.tr
                  key={row.id}
                  data-slot="table-row"
                  role={onSelectTicker ? "button" : undefined}
                  tabIndex={onSelectTicker ? 0 : undefined}
                  aria-selected={onSelectTicker ? selected : undefined}
                  onClick={
                    onSelectTicker
                      ? () => onSelectTicker(row.original.tickerSymbol)
                      : undefined
                  }
                  onKeyDown={
                    onSelectTicker
                      ? (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onSelectTicker(row.original.tickerSymbol);
                          }
                        }
                      : undefined
                  }
                  className={cn(
                    "border-b border-zinc-800 transition-colors hover:bg-muted/50",
                    onSelectTicker && "cursor-pointer",
                    selected && "bg-zinc-800/60 ring-1 ring-inset ring-zinc-700",
                  )}
                  initial={false}
                  animate={{
                    backgroundColor:
                      flash === "up"
                        ? "rgba(52, 211, 153, 0.12)"
                        : flash === "down"
                          ? "rgba(244, 63, 94, 0.12)"
                          : selected
                            ? "rgba(39, 39, 42, 0.6)"
                            : "rgba(0, 0, 0, 0)",
                  }}
                  transition={{ duration: 0.35 }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </motion.tr>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
