"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "tp_watchlist";
const EMPTY_WATCHLIST: string[] = [];

let cacheKey: string | null = null;
let cacheValue: string[] = EMPTY_WATCHLIST;

function parseWatchlist(raw: string | null): string[] {
  if (!raw) return EMPTY_WATCHLIST;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY_WATCHLIST;
    const tickers = parsed.filter(
      (item): item is string => typeof item === "string",
    );
    return tickers.length === 0 ? EMPTY_WATCHLIST : tickers;
  } catch {
    return EMPTY_WATCHLIST;
  }
}

function getSnapshot(): string[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  const key = raw ?? "";
  if (key === cacheKey) return cacheValue;
  cacheKey = key;
  cacheValue = parseWatchlist(raw);
  return cacheValue;
}

function getServerSnapshot(): string[] {
  return EMPTY_WATCHLIST;
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("tp-watchlist-change", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("tp-watchlist-change", onStoreChange);
  };
}

function writeWatchlist(tickers: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickers));
  cacheKey = null;
  window.dispatchEvent(new Event("tp-watchlist-change"));
}

export function useWatchlist() {
  const tickers = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const toggle = useCallback((ticker: string) => {
    const current = getSnapshot();
    const next = current.includes(ticker)
      ? current.filter((item) => item !== ticker)
      : [...current, ticker];
    writeWatchlist(next);
  }, []);

  const has = useCallback(
    (ticker: string) => tickers.includes(ticker),
    [tickers],
  );

  return { tickers, toggle, has };
}
