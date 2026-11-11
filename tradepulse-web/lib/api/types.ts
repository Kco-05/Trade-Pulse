export type ApiErrorBody = {
  error: string;
};

export type AuthResponse = {
  userId: number;
  username: string;
  walletBalance: number;
};

export type Balance = {
  userId: number;
  walletBalance: number;
};

export type Stock = {
  tickerSymbol: string;
  companyName: string;
  currentPrice: number;
};

export type StockQuote = {
  tickerSymbol: string;
  currentPrice: number;
};

export type PriceHistory = {
  price: number;
  recordedAt: string;
};

export type TradeRequest = {
  userId: number;
  tickerSymbol: string;
  quantity: number;
};

export type TradeReceipt = {
  transactionId: number;
  status: "SUCCESS";
  executionPrice: number;
};

export type Transaction = {
  transactionId: number;
  tickerSymbol: string;
  transactionType: "BUY" | "SELL";
  quantity: number;
  executionPrice: number;
  timestamp: string;
};

export type PortfolioHolding = {
  tickerSymbol: string;
  totalQuantity: number;
  averageBuyPrice: number;
  currentMarketPrice: number;
  profitLoss: number;
};

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
