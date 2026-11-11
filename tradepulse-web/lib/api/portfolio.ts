import { apiClient } from "./client";
import type {
  PortfolioHolding,
  TradeReceipt,
  TradeRequest,
  Transaction,
} from "./types";

export function getPortfolio(userId: number): Promise<PortfolioHolding[]> {
  return apiClient<PortfolioHolding[]>(`/api/portfolio/${userId}`);
}

export function getHistory(userId: number): Promise<Transaction[]> {
  return apiClient<Transaction[]>(`/api/trade/history/${userId}`);
}

export function buy(request: TradeRequest): Promise<TradeReceipt> {
  return apiClient<TradeReceipt>("/api/trade/buy", {
    method: "POST",
    body: request,
  });
}

export function sell(request: TradeRequest): Promise<TradeReceipt> {
  return apiClient<TradeReceipt>("/api/trade/sell", {
    method: "POST",
    body: request,
  });
}
