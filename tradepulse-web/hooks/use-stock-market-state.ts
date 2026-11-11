"use client";

import { useEffect, useRef, useState } from "react";

import type { Stock } from "@/lib/api";

const HISTORY_LIMIT = 60;
const FLASH_MS = 500;

export type PriceFlash = "up" | "down" | null;

export type MarketRow = {
  tickerSymbol: string;
  companyName: string;
  currentPrice: number;
  previousPrice: number | null;
  change: number;
  changePercent: number;
  history: number[];
  flash: PriceFlash;
  hasPriorTick: boolean;
};

export type MarketSummary = {
  topGainer: MarketRow | null;
  topLoser: MarketRow | null;
  mood: "bullish" | "bearish" | "mixed" | "waiting";
  gainerCount: number;
  loserCount: number;
};

type TickStore = {
  lastPrice: number;
  history: number[];
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function computeMarketSummary(rows: MarketRow[]): MarketSummary {
  const withPrior = rows.filter((row) => row.hasPriorTick);

  if (withPrior.length === 0) {
    return {
      topGainer: null,
      topLoser: null,
      mood: "waiting",
      gainerCount: 0,
      loserCount: 0,
    };
  }

  let topGainer = withPrior[0];
  let topLoser = withPrior[0];
  let gainerCount = 0;
  let loserCount = 0;

  for (const row of withPrior) {
    if (row.changePercent > topGainer.changePercent) topGainer = row;
    if (row.changePercent < topLoser.changePercent) topLoser = row;
    if (row.change > 0) gainerCount += 1;
    else if (row.change < 0) loserCount += 1;
  }

  let mood: MarketSummary["mood"] = "mixed";
  if (gainerCount > loserCount) mood = "bullish";
  else if (loserCount > gainerCount) mood = "bearish";

  return { topGainer, topLoser, mood, gainerCount, loserCount };
}

export function useStockMarketState(stocks: Stock[] | undefined): MarketRow[] {
  const [rows, setRows] = useState<MarketRow[]>([]);
  const storeRef = useRef(new Map<string, TickStore>());
  const timersRef = useRef(new Map<string, number>());

  useEffect(() => {
    if (!stocks) return;

    const reduced = prefersReducedMotion();

    const nextRows: MarketRow[] = stocks.map((stock) => {
      const existing = storeRef.current.get(stock.tickerSymbol);
      const price = stock.currentPrice;

      if (!existing) {
        const history = [price];
        storeRef.current.set(stock.tickerSymbol, {
          lastPrice: price,
          history,
        });
        return {
          tickerSymbol: stock.tickerSymbol,
          companyName: stock.companyName,
          currentPrice: price,
          previousPrice: null,
          change: 0,
          changePercent: 0,
          history,
          flash: null,
          hasPriorTick: false,
        };
      }

      const change = price - existing.lastPrice;
      const changePercent =
        existing.lastPrice === 0 ? 0 : (change / existing.lastPrice) * 100;
      const history = [...existing.history, price].slice(-HISTORY_LIMIT);

      let flash: PriceFlash = null;
      if (!reduced && change !== 0) {
        flash = change > 0 ? "up" : "down";
        const previousTimer = timersRef.current.get(stock.tickerSymbol);
        if (previousTimer !== undefined) {
          window.clearTimeout(previousTimer);
        }
        const timer = window.setTimeout(() => {
          setRows((current) =>
            current.map((row) =>
              row.tickerSymbol === stock.tickerSymbol
                ? { ...row, flash: null }
                : row,
            ),
          );
          timersRef.current.delete(stock.tickerSymbol);
        }, FLASH_MS);
        timersRef.current.set(stock.tickerSymbol, timer);
      }

      storeRef.current.set(stock.tickerSymbol, {
        lastPrice: price,
        history,
      });

      return {
        tickerSymbol: stock.tickerSymbol,
        companyName: stock.companyName,
        currentPrice: price,
        previousPrice: existing.lastPrice,
        change,
        changePercent,
        history,
        flash,
        hasPriorTick: true,
      };
    });

    setRows(nextRows);
  }, [stocks]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const timer of timers.values()) {
        window.clearTimeout(timer);
      }
      timers.clear();
    };
  }, []);

  return rows;
}
