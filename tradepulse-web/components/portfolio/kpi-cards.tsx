"use client";

import NumberFlow from "@number-flow/react";
import { ArrowDown, ArrowUp, Minus, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { PortfolioKpis } from "@/lib/portfolio-metrics";
import { cn } from "@/lib/utils";

type KpiCardsProps = {
  kpis: PortfolioKpis | null;
  isLoading?: boolean;
};

function CurrencyFlow({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
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
      className={cn("tabular-nums", className)}
    />
  );
}

function formatSignedCurrency(value: number): string {
  const abs = Math.abs(value).toFixed(2);
  if (value > 0) return `+$${abs}`;
  if (value < 0) return `-$${abs}`;
  return `$${abs}`;
}

function SignedPlBadge({ value }: { value: number }) {
  const up = value > 0;
  const down = value < 0;
  const Icon = up ? ArrowUp : down ? ArrowDown : Minus;

  return (
    <Badge
      variant="outline"
      className={cn(
        "mt-2 gap-1 tabular-nums",
        up && "border-emerald-400/30 bg-emerald-400/10 text-emerald-400",
        down && "border-rose-500/30 bg-rose-500/10 text-rose-500",
        !up && !down && "border-zinc-700 text-zinc-400",
      )}
    >
      <Icon data-icon="inline-start" className="size-3" />
      {formatSignedCurrency(value)}
    </Badge>
  );
}

export function KpiCardsSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}

export function KpiCards({ kpis, isLoading }: KpiCardsProps) {
  if (isLoading || !kpis) {
    return <KpiCardsSkeleton />;
  }

  const { cashBalance, holdingsValue, netWorth, totalPl } = kpis;
  const plUp = totalPl > 0;
  const plDown = totalPl < 0;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="bg-zinc-900/50 ring-zinc-800">
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-1.5">
            <Wallet className="size-3.5 text-zinc-400" aria-hidden />
            Net Worth
          </CardDescription>
          <CardTitle className="text-xl">
            <CurrencyFlow value={netWorth} className="text-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">Cash + holdings</p>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/50 ring-zinc-800">
        <CardHeader className="pb-2">
          <CardDescription>Cash Balance</CardDescription>
          <CardTitle className="text-xl">
            <CurrencyFlow value={cashBalance} className="text-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">Available to trade</p>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/50 ring-zinc-800">
        <CardHeader className="pb-2">
          <CardDescription>Holdings Value</CardDescription>
          <CardTitle className="text-xl">
            <CurrencyFlow value={holdingsValue} className="text-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">Mark-to-market</p>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/50 ring-zinc-800">
        <CardHeader className="pb-2">
          <CardDescription>Total P/L</CardDescription>
          <CardTitle
            className={cn(
              "text-xl",
              plUp && "text-emerald-400",
              plDown && "text-rose-500",
              !plUp && !plDown && "text-foreground",
            )}
          >
            <CurrencyFlow value={totalPl} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SignedPlBadge value={totalPl} />
        </CardContent>
      </Card>
    </div>
  );
}
