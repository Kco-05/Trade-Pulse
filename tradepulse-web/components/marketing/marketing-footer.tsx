import Link from "next/link";

import { Separator } from "@/components/ui/separator";

export function MarketingFooter() {
  return (
    <footer className="mt-auto border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-emerald-400/15 text-xs font-semibold text-emerald-400">
              TP
            </span>
            <span className="text-sm font-medium text-zinc-200">TradePulse</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
            <Link
              href="/market"
              className="hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
            >
              Market
            </Link>
            <Link
              href="/login"
              className="hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
            >
              Sign Up
            </Link>
          </div>
        </div>
        <Separator className="bg-zinc-800" />
        <p className="text-xs text-zinc-500">
          Simulated market, virtual funds. College lab project — not real
          brokerage software.
        </p>
      </div>
    </footer>
  );
}
