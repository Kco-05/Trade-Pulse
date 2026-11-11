"use client";

import { HistoryTable } from "@/components/portfolio/history-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useHistory } from "@/lib/api";
import { useSessionStore } from "@/lib/stores/session";

export default function HistoryPage() {
  const userId = useSessionStore((s) => s.userId);
  const historyQuery = useHistory(userId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          History
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your past buys and sells across the simulated market.
        </p>
      </div>

      {historyQuery.isError ? (
        <Alert variant="destructive" className="border-rose-500/30 bg-rose-500/10">
          <AlertTitle>Could not load history</AlertTitle>
          <AlertDescription>
            {historyQuery.error instanceof Error
              ? historyQuery.error.message
              : "Failed to load trade history"}
          </AlertDescription>
        </Alert>
      ) : historyQuery.isLoading && !historyQuery.data ? (
        <Skeleton className="h-72 rounded-xl" />
      ) : (
        <HistoryTable
          rows={historyQuery.data ?? []}
          isLoading={historyQuery.isLoading}
        />
      )}
    </div>
  );
}
