"use client";

import NumberFlow from "@number-flow/react";
import { Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";
import { useBalance, useBuy, usePortfolio, useSell } from "@/lib/api";
import { ApiError } from "@/lib/api/types";
import { formatCurrency } from "@/lib/formatCurrency";
import { useSessionStore } from "@/lib/stores/session";
import { cn } from "@/lib/utils";

const MIN_QTY = 1;
const MAX_QTY = 10000;

type TradeType = "buy" | "sell";
type QuickSize = "25" | "50" | "75" | "max";

export type ExecutionSlipProps = {
  selectedTicker: string | null;
  currentPrice: number | null;
  /** Prefill Buy/Sell tab from deep links like `/?ticker=AAPL&side=sell`. */
  initialSide?: TradeType;
};

function clampQuantity(value: number): number {
  if (!Number.isFinite(value)) {
    return MIN_QTY;
  }
  return Math.min(MAX_QTY, Math.max(MIN_QTY, Math.trunc(value)));
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
      className="tabular-nums"
    />
  );
}

function ExecutionSlipForm({
  selectedTicker,
  currentPrice,
  initialSide,
}: ExecutionSlipProps) {
  const userId = useSessionStore((s) => s.userId);
  const loggedIn = userId != null;

  const balanceQuery = useBalance(userId);
  const portfolioQuery = usePortfolio(userId);
  const buyMutation = useBuy();
  const sellMutation = useSell();

  const [tradeType, setTradeType] = useState<TradeType>(initialSide ?? "buy");
  const [quantity, setQuantity] = useState(MIN_QTY);
  const [quickSize, setQuickSize] = useState<QuickSize | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const walletBalance = balanceQuery.data?.walletBalance ?? 0;
  const price = currentPrice != null && currentPrice > 0 ? currentPrice : 0;

  const sharesHeld = useMemo(() => {
    if (!selectedTicker || !portfolioQuery.data) {
      return 0;
    }
    const holding = portfolioQuery.data.find(
      (row) => row.tickerSymbol === selectedTicker,
    );
    return holding?.totalQuantity ?? 0;
  }, [portfolioQuery.data, selectedTicker]);

  const maxBuy = price > 0 ? Math.floor(walletBalance / price) : 0;
  const maxSell = sharesHeld;
  const maxForSide = tradeType === "buy" ? maxBuy : maxSell;

  const estimated = quantity * price;
  const cashAfter =
    tradeType === "buy" ? walletBalance - estimated : walletBalance + estimated;

  const validationError = useMemo(() => {
    if (!loggedIn) return null;
    if (!selectedTicker || price <= 0) return "Select a stock to trade";
    if (tradeType === "buy" && (maxBuy < 1 || estimated > walletBalance)) {
      return "Insufficient funds";
    }
    if (tradeType === "sell" && (sharesHeld < 1 || quantity > sharesHeld)) {
      return "Insufficient shares";
    }
    return null;
  }, [
    estimated,
    loggedIn,
    maxBuy,
    price,
    quantity,
    selectedTicker,
    sharesHeld,
    tradeType,
    walletBalance,
  ]);

  const pending = buyMutation.isPending || sellMutation.isPending;
  const canSubmit =
    loggedIn &&
    !validationError &&
    !!selectedTicker &&
    price > 0 &&
    quantity >= MIN_QTY &&
    !pending;

  function applyQuickSize(size: QuickSize) {
    setQuickSize(size);
    const ratio =
      size === "25" ? 0.25 : size === "50" ? 0.5 : size === "75" ? 0.75 : 1;
    const raw = size === "max" ? maxForSide : Math.floor(maxForSide * ratio);
    setQuantity(clampQuantity(Math.max(raw, maxForSide > 0 ? 1 : MIN_QTY)));
  }

  function updateQuantity(next: number) {
    setQuickSize(null);
    setQuantity(clampQuantity(next));
  }

  async function executeTrade() {
    if (!userId || !selectedTicker || !canSubmit) {
      return;
    }

    const request = {
      userId,
      tickerSymbol: selectedTicker,
      quantity,
    };

    try {
      const receipt =
        tradeType === "buy"
          ? await buyMutation.mutateAsync(request)
          : await sellMutation.mutateAsync(request);

      toast.success(
        `${tradeType === "buy" ? "Bought" : "Sold"} ${quantity} ${selectedTicker}`,
        {
          description: `Transaction #${receipt.transactionId} @ ${formatCurrency(receipt.executionPrice)}`,
        },
      );
      setConfirmOpen(false);
      setQuantity(MIN_QTY);
      setQuickSize(null);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Trade failed";
      toast.error(message);
    }
  }

  const confirmCopy =
    selectedTicker && price > 0
      ? `${tradeType === "buy" ? "Buy" : "Sell"} ${quantity} ${selectedTicker} for about ${formatCurrency(estimated)}?`
      : "Confirm this trade?";

  return (
    <div className="relative flex flex-col gap-4">
      <Tabs
        value={tradeType}
        onValueChange={(value) => {
          if (value === "buy" || value === "sell") {
            setTradeType(value);
            setQuickSize(null);
          }
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="buy"
            className="data-active:bg-emerald-400/15 data-active:text-emerald-400"
          >
            Buy
          </TabsTrigger>
          <TabsTrigger
            value="sell"
            className="data-active:bg-rose-500/15 data-active:text-rose-500"
          >
            Sell
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="trade-quantity" className="text-sm text-muted-foreground">
            Quantity
          </label>
          <span className="text-xs text-muted-foreground tabular-nums">
            {selectedTicker
              ? tradeType === "buy"
                ? `Max ${maxBuy}`
                : `Held ${sharesHeld}`
              : "—"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Decrease quantity"
            disabled={!loggedIn}
            onClick={() => updateQuantity(quantity - 1)}
          >
            <Minus />
          </Button>
          <Input
            id="trade-quantity"
            type="number"
            inputMode="numeric"
            min={MIN_QTY}
            max={MAX_QTY}
            step={1}
            value={quantity}
            disabled={!loggedIn}
            onChange={(event) => updateQuantity(Number(event.target.value))}
            className="h-9 text-center tabular-nums"
            aria-invalid={!!validationError}
          />
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Increase quantity"
            disabled={!loggedIn}
            onClick={() => updateQuantity(quantity + 1)}
          >
            <Plus />
          </Button>
        </div>
        <Slider
          min={MIN_QTY}
          max={MAX_QTY}
          step={1}
          value={[quantity]}
          disabled={!loggedIn}
          onValueChange={(value) => {
            const next = Array.isArray(value) ? value[0] : value;
            updateQuantity(next);
          }}
          aria-label="Quantity slider"
        />
      </div>

      <ToggleGroup
        value={quickSize ? [quickSize] : []}
        onValueChange={(values) => {
          const next = values[0] as QuickSize | undefined;
          if (next) applyQuickSize(next);
        }}
        variant="outline"
        size="sm"
        className="flex w-full flex-wrap"
        disabled={!loggedIn}
      >
        <ToggleGroupItem value="25" className="flex-1">
          25%
        </ToggleGroupItem>
        <ToggleGroupItem value="50" className="flex-1">
          50%
        </ToggleGroupItem>
        <ToggleGroupItem value="75" className="flex-1">
          75%
        </ToggleGroupItem>
        <ToggleGroupItem value="max" className="flex-1">
          Max
        </ToggleGroupItem>
      </ToggleGroup>

      <dl className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 text-sm">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted-foreground">Current price</dt>
          <dd className="font-medium text-foreground">
            {price > 0 ? <CurrencyFlow value={price} /> : "—"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted-foreground">Quantity</dt>
          <dd className="font-medium tabular-nums text-foreground">
            <NumberFlow value={quantity} className="tabular-nums" />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted-foreground">
            {tradeType === "buy" ? "Estimated cost" : "Estimated proceeds"}
          </dt>
          <dd className="font-medium text-foreground">
            <CurrencyFlow value={estimated} />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted-foreground">Available cash</dt>
          <dd className="font-medium text-foreground">
            {loggedIn ? <CurrencyFlow value={walletBalance} /> : "—"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted-foreground">Cash after trade</dt>
          <dd className="font-medium text-foreground">
            {loggedIn ? <CurrencyFlow value={cashAfter} /> : "—"}
          </dd>
        </div>
      </dl>

      {validationError ? (
        <p className="text-sm text-rose-500" role="alert">
          {validationError}
        </p>
      ) : null}

      {tradeType === "buy" ? (
        <ShimmerButton
          type="button"
          disabled={!canSubmit}
          onClick={() => setConfirmOpen(true)}
          className="h-10 w-full rounded-lg px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-50"
          background="#34d399"
          shimmerColor="#ecfdf5"
          borderRadius="0.5rem"
        >
          {pending ? "Submitting…" : `Buy ${selectedTicker ?? ""}`}
        </ShimmerButton>
      ) : (
        <Button
          type="button"
          disabled={!canSubmit}
          onClick={() => setConfirmOpen(true)}
          className="h-10 w-full bg-rose-500 text-white hover:bg-rose-500/90"
        >
          {pending ? "Submitting…" : `Sell ${selectedTicker ?? ""}`}
        </Button>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm trade</AlertDialogTitle>
            <AlertDialogDescription>{confirmCopy}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending || !canSubmit}
              onClick={(event) => {
                event.preventDefault();
                void executeTrade();
              }}
              className={
                tradeType === "buy"
                  ? "bg-emerald-400 text-zinc-950 hover:bg-emerald-400/90"
                  : "bg-rose-500 text-white hover:bg-rose-500/90"
              }
            >
              {pending ? "Working…" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {!loggedIn ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-[inherit] bg-zinc-950/55 p-4 backdrop-blur-sm">
          <BorderBeam
            size={80}
            duration={8}
            colorFrom="#34d399"
            colorTo="#71717a"
            borderWidth={1.5}
          />
          <p className="text-sm text-muted-foreground">Sign in to place trades</p>
          <Button
            render={<Link href="/login" />}
            className="bg-emerald-400 text-zinc-950 hover:bg-emerald-400/90"
          >
            Log in to trade
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function ExecutionSlip({
  selectedTicker,
  currentPrice,
  initialSide,
}: ExecutionSlipProps) {
  const isMobile = useIsMobile();
  const title = selectedTicker ? `Trade ${selectedTicker}` : "Trade";

  if (isMobile) {
    return (
      <Drawer showSwipeHandle>
        <DrawerTrigger
          className={cn(
            "fixed right-4 bottom-4 z-40 inline-flex h-11 items-center justify-center rounded-lg bg-emerald-400 px-4 text-sm font-medium text-zinc-950 shadow-lg",
            "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
          )}
        >
          Trade{selectedTicker ? ` ${selectedTicker}` : ""}
        </DrawerTrigger>
        <DrawerContent className="bg-zinc-950">
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>
              Market order at the live simulated price.
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-6">
            <ExecutionSlipForm
              key={`${selectedTicker ?? "none"}-${initialSide ?? "buy"}`}
              selectedTicker={selectedTicker}
              currentPrice={currentPrice}
              initialSide={initialSide}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Card className="relative sticky top-4 overflow-hidden border-zinc-800 bg-zinc-900/50 shadow-none">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Market order at the live simulated price.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ExecutionSlipForm
          key={`${selectedTicker ?? "none"}-${initialSide ?? "buy"}`}
          selectedTicker={selectedTicker}
          currentPrice={currentPrice}
          initialSide={initialSide}
        />
      </CardContent>
    </Card>
  );
}
