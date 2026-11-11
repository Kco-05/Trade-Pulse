"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { buy, getPortfolio, sell } from "./portfolio";
import { getStockHistory, getStocks } from "./stocks";
import type { TradeRequest } from "./types";
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

function useInvalidateTradeQueries() {
  const queryClient = useQueryClient();

  return (userId: number) =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["balance", userId] }),
      queryClient.invalidateQueries({ queryKey: ["portfolio", userId] }),
    ]);
}

export function useBuy() {
  const invalidate = useInvalidateTradeQueries();

  return useMutation({
    mutationFn: (request: TradeRequest) => buy(request),
    onSuccess: (_receipt, request) => invalidate(request.userId),
  });
}

export function useSell() {
  const invalidate = useInvalidateTradeQueries();

  return useMutation({
    mutationFn: (request: TradeRequest) => sell(request),
    onSuccess: (_receipt, request) => invalidate(request.userId),
  });
}
