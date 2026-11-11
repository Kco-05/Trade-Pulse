"use client";

import { useId } from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";

/** Keep the visible window short so small ticks aren't flattened by old history. */
const VISIBLE_POINTS = 18;
/** Color from the last few samples for a snappy up/down read. */
const COLOR_LOOKBACK = 3;

type SparklineProps = {
  history: number[];
};

export function Sparkline({ history }: SparklineProps) {
  const gradientId = useId().replace(/:/g, "");

  if (history.length < 2) {
    return (
      <div
        className="flex h-9 w-[100px] items-center justify-center text-xs text-muted-foreground"
        aria-hidden
      >
        —
      </div>
    );
  }

  const visible = history.slice(-VISIBLE_POINTS);
  const data = visible.map((price, index) => ({ index, price }));
  const last = visible[visible.length - 1];
  const recentStart = visible[Math.max(0, visible.length - COLOR_LOOKBACK)];
  const up = last >= recentStart;
  const stroke = up ? "#34d399" : "#f43f5e";

  const min = Math.min(...visible);
  const max = Math.max(...visible);
  const span = max - min;
  // Tight domain so micro-moves fill the spark height instead of looking flat.
  const pad = span === 0 ? Math.max(Math.abs(last) * 0.0002, 0.005) : span * 0.04;

  return (
    <div className="h-9 w-[100px]" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.45} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={[min - pad, max + pad]} />
          <Area
            type="monotone"
            dataKey="price"
            stroke={stroke}
            strokeWidth={1.75}
            fill={`url(#${gradientId})`}
            fillOpacity={1}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
