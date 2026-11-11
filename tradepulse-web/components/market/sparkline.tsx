"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";

type SparklineProps = {
  history: number[];
};

export function Sparkline({ history }: SparklineProps) {
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

  const data = history.map((price, index) => ({ index, price }));
  const up = history[history.length - 1] >= history[0];
  const stroke = up ? "#34d399" : "#f43f5e";

  return (
    <div className="h-9 w-[100px]" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 0, bottom: 4, left: 0 }}>
          <Line
            type="monotone"
            dataKey="price"
            stroke={stroke}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
