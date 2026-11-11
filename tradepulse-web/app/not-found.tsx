import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-950 px-4 text-center">
      <p className="text-sm font-medium tracking-wide text-emerald-400 uppercase">
        TradePulse
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        404 — Delisted
      </h1>
      <p className="mt-3 max-w-md text-sm text-zinc-400">
        This page is not on the board. Head back to the live market and pick a
        ticker that still trades.
      </p>
      <Button
        className="mt-8"
        size="lg"
        render={<Link href="/market" />}
        nativeButton={false}
      >
        Back to Market
      </Button>
    </main>
  );
}
