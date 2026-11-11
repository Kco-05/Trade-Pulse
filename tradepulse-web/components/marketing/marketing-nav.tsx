import Link from "next/link";

import { Button } from "@/components/ui/button";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-400/15 text-sm font-semibold text-emerald-400">
            TP
          </span>
          <span className="font-semibold tracking-tight text-zinc-50">
            TradePulse
          </span>
        </Link>

        <nav
          aria-label="Marketing"
          className="flex items-center gap-1 sm:gap-2"
        >
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-300 hover:text-zinc-50"
            render={<Link href="/market" />}
            nativeButton={false}
          >
            Open market
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-300 hover:text-zinc-50"
            render={<Link href="/login" />}
            nativeButton={false}
          >
            Login
          </Button>
          <Button
            size="sm"
            className="bg-emerald-400 text-zinc-950 hover:bg-emerald-400/90"
            render={<Link href="/signup" />}
            nativeButton={false}
          >
            Sign Up
          </Button>
        </nav>
      </div>
    </header>
  );
}
