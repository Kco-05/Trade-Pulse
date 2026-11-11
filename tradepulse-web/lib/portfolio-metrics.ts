import type { PortfolioHolding, Stock } from "@/lib/api/types";

/** Virtual starting cash for every new TradePulse account (docs/REQUIREMENTS.md). */
export const STARTING_BALANCE = 100_000;

export type HoldingRow = {
  tickerSymbol: string;
  shares: number;
  averageBuyPrice: number;
  livePrice: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercent: number;
  allocationPercent: number;
};

export type PortfolioKpis = {
  cashBalance: number;
  holdingsValue: number;
  netWorth: number;
  totalPl: number;
};

function toCents(value: number): number {
  return Math.round(value * 100);
}

function fromCents(cents: number): number {
  return cents / 100;
}

/** qty × price in dollars, rounded via integer cents. */
export function multiplyMoney(quantity: number, price: number): number {
  return fromCents(Math.round(quantity) * toCents(price));
}

export function sumMoney(values: Iterable<number>): number {
  let cents = 0;
  for (const value of values) {
    cents += toCents(value);
  }
  return fromCents(cents);
}

function livePriceFor(
  holding: PortfolioHolding,
  priceByTicker: Map<string, number>,
): number {
  const live = priceByTicker.get(holding.tickerSymbol);
  if (live != null && Number.isFinite(live)) {
    return live;
  }
  return holding.currentMarketPrice;
}

export function buildPriceMap(stocks: Stock[] | undefined): Map<string, number> {
  const map = new Map<string, number>();
  if (!stocks) return map;
  for (const stock of stocks) {
    map.set(stock.tickerSymbol, stock.currentPrice);
  }
  return map;
}

export function buildHoldingRows(
  holdings: PortfolioHolding[] | undefined,
  priceByTicker: Map<string, number>,
): HoldingRow[] {
  if (!holdings || holdings.length === 0) {
    return [];
  }

  const withValues = holdings.map((holding) => {
    const livePrice = livePriceFor(holding, priceByTicker);
    const totalValue = multiplyMoney(holding.totalQuantity, livePrice);
    const costBasis = multiplyMoney(
      holding.totalQuantity,
      holding.averageBuyPrice,
    );
    const profitLoss = fromCents(toCents(totalValue) - toCents(costBasis));
    const profitLossPercent =
      costBasis > 0 ? (profitLoss / costBasis) * 100 : 0;

    return {
      tickerSymbol: holding.tickerSymbol,
      shares: holding.totalQuantity,
      averageBuyPrice: holding.averageBuyPrice,
      livePrice,
      totalValue,
      profitLoss,
      profitLossPercent,
    };
  });

  const holdingsValue = sumMoney(withValues.map((row) => row.totalValue));
  const holdingsCents = toCents(holdingsValue);

  return withValues.map((row) => ({
    ...row,
    allocationPercent:
      holdingsCents > 0 ? (toCents(row.totalValue) / holdingsCents) * 100 : 0,
  }));
}

export function computePortfolioKpis(
  cashBalance: number,
  holdingRows: HoldingRow[],
): PortfolioKpis {
  const holdingsValue = sumMoney(holdingRows.map((row) => row.totalValue));
  const netWorth = fromCents(toCents(cashBalance) + toCents(holdingsValue));
  const totalPl = fromCents(toCents(netWorth) - toCents(STARTING_BALANCE));

  return {
    cashBalance,
    holdingsValue,
    netWorth,
    totalPl,
  };
}
