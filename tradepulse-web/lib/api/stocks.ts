import { apiClient } from "./client";
import type { PriceHistory, Stock, StockQuote } from "./types";

export function getStocks(): Promise<Stock[]> {
  return apiClient<Stock[]>("/api/stocks");
}

export function getStock(tickerSymbol: string): Promise<StockQuote> {
  return apiClient<StockQuote>(
    `/api/stocks/${encodeURIComponent(tickerSymbol)}`,
  );
}

export function getStockHistory(
  tickerSymbol: string,
  limit = 500,
): Promise<PriceHistory[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  return apiClient<PriceHistory[]>(
    `/api/stocks/${encodeURIComponent(tickerSymbol)}/history?${params}`,
  );
}
