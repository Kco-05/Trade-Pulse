"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { EmptyTradeCta } from "@/components/portfolio/empty-trade-cta";
import { createHistoryColumns } from "@/components/portfolio/history-columns";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Transaction } from "@/lib/api/types";

type SideFilter = "all" | "BUY" | "SELL";

type HistoryTableProps = {
  rows: Transaction[];
  isLoading?: boolean;
};

export function HistoryTable({ rows, isLoading }: HistoryTableProps) {
  const [side, setSide] = useState<SideFilter>("all");
  const [ticker, setTicker] = useState<string>("all");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "timestamp", desc: true },
  ]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns = useMemo(() => createHistoryColumns(), []);

  const tickers = useMemo(() => {
    const set = new Set(rows.map((row) => row.tickerSymbol));
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (side !== "all" && row.transactionType !== side) return false;
      if (ticker !== "all" && row.tickerSymbol !== ticker) return false;
      return true;
    });
  }, [rows, side, ticker]);

  // TanStack Table returns unstable function identities; React Compiler skips this component.
  // eslint-disable-next-line react-hooks/incompatible-library -- expected with useReactTable
  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => String(row.transactionId),
  });

  if (isLoading) {
    return <Skeleton className="h-72 rounded-xl" />;
  }

  if (rows.length === 0) {
    return (
      <EmptyTradeCta
        title="No trades yet"
        description="Your buy and sell history will show up here after your first trade."
      />
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            value={side}
            onValueChange={(value) => {
              if (value === "all" || value === "BUY" || value === "SELL") {
                setSide(value);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }
            }}
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="BUY">Buy</TabsTrigger>
              <TabsTrigger value="SELL">Sell</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select
            value={ticker}
            onValueChange={(value) => {
              if (typeof value === "string") {
                setTicker(value);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }
            }}
          >
            <SelectTrigger className="w-full sm:w-44" size="default">
              <SelectValue>
                {(value: string | null) =>
                  value === "all" || value == null ? "All tickers" : value
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tickers</SelectItem>
              {tickers.map((symbol) => (
                <SelectItem key={symbol} value={symbol}>
                  {symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
                    No results found
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="border-zinc-800">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground tabular-nums">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {Math.max(table.getPageCount(), 1)}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
