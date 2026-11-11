"use client";

import {
  AreaSeries,
  CandlestickSeries,
  ColorType,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type MouseEventParams,
  type UTCTimestamp,
} from "lightweight-charts";
import { useEffect, useRef, useState } from "react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useStockHistory } from "@/lib/api";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  applyLivePrice,
  candlesToAreaData,
  candlesToCandleData,
  isSeriesUp,
  ticksToOhlc,
  type ChartTimeframe,
  type OhlcCandle,
} from "@/lib/market/ohlc";
import { cn } from "@/lib/utils";

type ChartType = "line" | "candles";

type PriceChartProps = {
  ticker: string;
  livePrice: number | null;
  /** Bumps on each useStocks poll so same-price ticks still update the chart. */
  tickAt?: number;
};

type LegendState =
  | { kind: "area"; price: number; time: number }
  | {
      kind: "candle";
      open: number;
      high: number;
      low: number;
      close: number;
      time: number;
    }
  | null;

const EMERALD = "#34d399";
const ROSE = "#f43f5e";
const ZINC_950 = "#09090b";
const ZINC_800 = "#27272a";
const ZINC_400 = "#a1a1aa";

function areaColors(up: boolean) {
  if (up) {
    return {
      lineColor: EMERALD,
      topColor: "rgba(52, 211, 153, 0.35)",
      bottomColor: "rgba(52, 211, 153, 0.02)",
    };
  }
  return {
    lineColor: ROSE,
    topColor: "rgba(244, 63, 94, 0.35)",
    bottomColor: "rgba(244, 63, 94, 0.02)",
  };
}

function formatLegendTime(unixSeconds: number): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(unixSeconds * 1000));
}

export function PriceChart({ ticker, livePrice, tickAt }: PriceChartProps) {
  const { data, isLoading, isError, error } = useStockHistory(ticker);
  const [chartType, setChartType] = useState<ChartType>("line");
  const [timeframe, setTimeframe] = useState<ChartTimeframe>("1m");
  const [legend, setLegend] = useState<LegendState>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | ISeriesApi<"Candlestick"> | null>(
    null,
  );
  const candlesRef = useRef<OhlcCandle[]>([]);
  const crosshairHandlerRef = useRef<((param: MouseEventParams) => void) | null>(
    null,
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: ZINC_950 },
        textColor: ZINC_400,
      },
      grid: {
        vertLines: { color: ZINC_800 },
        horzLines: { color: ZINC_800 },
      },
      rightPriceScale: {
        borderColor: ZINC_800,
      },
      timeScale: {
        borderColor: ZINC_800,
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: {
          color: "rgba(161, 161, 170, 0.4)",
          labelBackgroundColor: ZINC_800,
        },
        horzLine: {
          color: "rgba(161, 161, 170, 0.4)",
          labelBackgroundColor: ZINC_800,
        },
      },
    });

    chartRef.current = chart;

    return () => {
      if (crosshairHandlerRef.current) {
        chart.unsubscribeCrosshairMove(crosshairHandlerRef.current);
        crosshairHandlerRef.current = null;
      }
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !data) return;

    if (crosshairHandlerRef.current) {
      chart.unsubscribeCrosshairMove(crosshairHandlerRef.current);
      crosshairHandlerRef.current = null;
    }

    if (seriesRef.current) {
      chart.removeSeries(seriesRef.current);
      seriesRef.current = null;
    }

    const candles = ticksToOhlc(data, timeframe);
    candlesRef.current = candles;
    setLegend(null);

    if (candles.length === 0) return;

    const up = isSeriesUp(candles);

    if (chartType === "line") {
      const series = chart.addSeries(AreaSeries, {
        ...areaColors(up),
        lineWidth: 2,
        priceLineVisible: false,
      });
      series.setData(candlesToAreaData(candles));
      seriesRef.current = series;

      const onMove = (param: MouseEventParams) => {
        if (!param.time || !seriesRef.current) {
          setLegend(null);
          return;
        }
        const point = param.seriesData.get(seriesRef.current) as
          | { time: UTCTimestamp; value: number }
          | undefined;
        if (!point) {
          setLegend(null);
          return;
        }
        setLegend({
          kind: "area",
          price: point.value,
          time: point.time as number,
        });
      };
      chart.subscribeCrosshairMove(onMove);
      crosshairHandlerRef.current = onMove;
    } else {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: EMERALD,
        downColor: ROSE,
        borderUpColor: EMERALD,
        borderDownColor: ROSE,
        wickUpColor: EMERALD,
        wickDownColor: ROSE,
        borderVisible: false,
      });
      series.setData(candlesToCandleData(candles));
      seriesRef.current = series;

      const onMove = (param: MouseEventParams) => {
        if (!param.time || !seriesRef.current) {
          setLegend(null);
          return;
        }
        const point = param.seriesData.get(seriesRef.current) as
          | {
              time: UTCTimestamp;
              open: number;
              high: number;
              low: number;
              close: number;
            }
          | undefined;
        if (!point) {
          setLegend(null);
          return;
        }
        setLegend({
          kind: "candle",
          open: point.open,
          high: point.high,
          low: point.low,
          close: point.close,
          time: point.time as number,
        });
      };
      chart.subscribeCrosshairMove(onMove);
      crosshairHandlerRef.current = onMove;
    }

    chart.timeScale().fitContent();
  }, [data, chartType, timeframe, ticker]);

  useEffect(() => {
    if (livePrice == null || !Number.isFinite(livePrice)) return;

    const series = seriesRef.current;
    if (!series) return;

    const candle = applyLivePrice(candlesRef.current, livePrice, timeframe);
    if (!candle) return;

    if (chartType === "line") {
      (series as ISeriesApi<"Area">).update({
        time: candle.time as UTCTimestamp,
        value: candle.close,
      });
      series.applyOptions(areaColors(isSeriesUp(candlesRef.current)));
    } else {
      (series as ISeriesApi<"Candlestick">).update({
        time: candle.time as UTCTimestamp,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      });
    }
  }, [livePrice, tickAt, ticker, chartType, timeframe]);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-medium text-foreground">{ticker}</h2>
          <p className="text-xs text-muted-foreground">
            Live price chart · 5s ticks
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ToggleGroup
            value={[chartType]}
            onValueChange={(values) => {
              const next = values[0] as ChartType | undefined;
              if (next) setChartType(next);
            }}
            variant="outline"
            size="sm"
            aria-label="Chart type"
          >
            <ToggleGroupItem value="line">Line</ToggleGroupItem>
            <ToggleGroupItem value="candles">Candles</ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup
            value={[timeframe]}
            onValueChange={(values) => {
              const next = values[0] as ChartTimeframe | undefined;
              if (next) setTimeframe(next);
            }}
            variant="outline"
            size="sm"
            aria-label="Timeframe"
          >
            <ToggleGroupItem value="1m">1m</ToggleGroupItem>
            <ToggleGroupItem value="5m">5m</ToggleGroupItem>
            <ToggleGroupItem value="15m">15m</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="relative h-80 w-full">
        {isLoading && !data ? (
          <Skeleton className="absolute inset-0 h-full w-full rounded-lg" />
        ) : null}

        {isError ? (
          <div
            role="alert"
            className="absolute inset-0 flex items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 text-sm text-rose-500"
          >
            {error instanceof Error ? error.message : "Failed to load history"}
          </div>
        ) : null}

        {!isLoading && !isError && data && data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            No price history yet — waiting for the next market tick.
          </div>
        ) : null}

        {legend ? (
          <Card className="pointer-events-none absolute top-2 left-2 z-10 gap-1 border-zinc-800 bg-zinc-950/90 px-3 py-2 text-xs shadow-none">
            <div className="text-zinc-400 tabular-nums">
              {formatLegendTime(legend.time)}
            </div>
            {legend.kind === "area" ? (
              <div className="font-medium tabular-nums text-foreground">
                {formatCurrency(legend.price)}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 tabular-nums text-foreground">
                <span className="text-zinc-400">O</span>
                <span>{formatCurrency(legend.open)}</span>
                <span className="text-zinc-400">H</span>
                <span>{formatCurrency(legend.high)}</span>
                <span className="text-zinc-400">L</span>
                <span>{formatCurrency(legend.low)}</span>
                <span className="text-zinc-400">C</span>
                <span>{formatCurrency(legend.close)}</span>
              </div>
            )}
          </Card>
        ) : null}

        <div
          ref={containerRef}
          className={cn(
            "h-full w-full",
            (isLoading && !data) || isError ? "invisible" : "visible",
          )}
          aria-label={`${ticker} price chart`}
        />
      </div>
    </div>
  );
}
