import { apiClient } from "./client";
import type { Stock, StockQuote } from "./types";

export function getStocks(): Promise<Stock[]> {
  return apiClient<Stock[]>("/api/stocks");
}

export function getStock(tickerSymbol: string): Promise<StockQuote> {
  return apiClient<StockQuote>(
    `/api/stocks/${encodeURIComponent(tickerSymbol)}`,
  );
}
