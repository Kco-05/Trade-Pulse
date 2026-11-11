import type { UTCTimestamp } from "lightweight-charts";

import type { PriceHistory } from "@/lib/api/types";

export type ChartTimeframe = "1m" | "5m" | "15m";

export type OhlcCandle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export const TIMEFRAME_SECONDS: Record<ChartTimeframe, number> = {
  "1m": 60,
  "5m": 300,
  "15m": 900,
};

export function toUnixSeconds(recordedAt: string): number {
  return Math.floor(Date.parse(recordedAt) / 1000);
}

export function bucketTime(unixSeconds: number, bucketSeconds: number): number {
  return Math.floor(unixSeconds / bucketSeconds) * bucketSeconds;
}

/** Aggregate raw price ticks into OHLC candles for the given timeframe. */
export function ticksToOhlc(
  ticks: PriceHistory[],
  timeframe: ChartTimeframe,
): OhlcCandle[] {
  const bucketSeconds = TIMEFRAME_SECONDS[timeframe];
  const candles: OhlcCandle[] = [];

  for (const tick of ticks) {
    const price = tick.price;
    if (!Number.isFinite(price)) continue;

    const time = bucketTime(toUnixSeconds(tick.recordedAt), bucketSeconds);
    const last = candles[candles.length - 1];

    if (!last || last.time !== time) {
      candles.push({
        time,
        open: price,
        high: price,
        low: price,
        close: price,
      });
      continue;
    }

    last.high = Math.max(last.high, price);
    last.low = Math.min(last.low, price);
    last.close = price;
  }

  return candles;
}

/** Apply a live price to the candle list; returns the candle for series.update. */
export function applyLivePrice(
  candles: OhlcCandle[],
  price: number,
  timeframe: ChartTimeframe,
  nowUnixSeconds = Math.floor(Date.now() / 1000),
): OhlcCandle | null {
  if (!Number.isFinite(price)) return null;

  const time = bucketTime(nowUnixSeconds, TIMEFRAME_SECONDS[timeframe]);
  const last = candles[candles.length - 1];

  if (!last || last.time !== time) {
    const candle: OhlcCandle = {
      time,
      open: price,
      high: price,
      low: price,
      close: price,
    };
    candles.push(candle);
    return candle;
  }

  last.high = Math.max(last.high, price);
  last.low = Math.min(last.low, price);
  last.close = price;
  return last;
}

export function isSeriesUp(candles: OhlcCandle[]): boolean {
  if (candles.length === 0) return true;
  return candles[candles.length - 1].close >= candles[0].open;
}

export function candlesToAreaData(candles: OhlcCandle[]) {
  return candles.map((c) => ({
    time: c.time as UTCTimestamp,
    value: c.close,
  }));
}

export function candlesToCandleData(candles: OhlcCandle[]) {
  return candles.map((c) => ({
    time: c.time as UTCTimestamp,
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
  }));
}
