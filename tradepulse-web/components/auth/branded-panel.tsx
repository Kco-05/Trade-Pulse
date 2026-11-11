import { GridPattern } from "@/components/ui/grid-pattern";
import { cn } from "@/lib/utils";

export function BrandedPanel() {
  return (
    <div className="relative hidden h-full min-h-[520px] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 lg:block">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(52,211,153,0.12),_transparent_55%)]" />
      <GridPattern
        width={36}
        height={36}
        x={-1}
        y={-1}
        strokeDasharray="4 2"
        className={cn(
          "fill-zinc-700/20 stroke-zinc-700/40",
          "[mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]",
        )}
      />
      <div className="relative z-10 flex h-full flex-col justify-between p-10">
        <div>
          <p className="text-sm font-medium tracking-[0.2em] text-emerald-400 uppercase">
            TradePulse
          </p>
          <h1 className="mt-4 max-w-sm text-3xl font-semibold tracking-tight text-zinc-50">
            Trade. Track. Learn.
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-400">
            A college-lab simulator with live price ticks, virtual wallets, and
            honest microservice wiring — no fake volume or invented news.
          </p>
        </div>
        <p className="text-xs text-zinc-500">
          Simulated market · $100,000 start · 10 tickers · 5-second updates
        </p>
      </div>
    </div>
  );
}
