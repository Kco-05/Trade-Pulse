"use client";

import { useQuery } from "@tanstack/react-query";
import { getPortfolio } from "./portfolio";
import { getStockHistory, getStocks } from "./stocks";
import { getBalance } from "./wallet";

export function useStocks() {
  return useQuery({
    queryKey: ["stocks"],
    queryFn: getStocks,
    refetchInterval: 5000,
  });
}

export function useStockHistory(ticker: string | null | undefined) {
  return useQuery({
    queryKey: ["stock-history", ticker],
    queryFn: () => getStockHistory(ticker as string),
    enabled: !!ticker,
  });
}

export function useBalance(userId: number | null | undefined) {
  return useQuery({
    queryKey: ["balance", userId],
    queryFn: () => getBalance(userId as number),
    enabled: userId != null,
  });
}

export function usePortfolio(userId: number | null | undefined) {
  return useQuery({
    queryKey: ["portfolio", userId],
    queryFn: () => getPortfolio(userId as number),
    enabled: userId != null,
  });
}
