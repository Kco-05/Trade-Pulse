"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Meteors } from "@/components/ui/meteors";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export function LandingHero() {
  const router = useRouter();
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <section className="relative overflow-hidden border-b border-zinc-800/80">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {!reduceMotion ? <Meteors number={18} /> : null}
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-24 sm:px-6 sm:py-32">
        <p className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-400">
          Live simulated market
        </p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl lg:text-6xl">
          Simulated trading on a real{" "}
          <span className="text-emerald-400">microservice</span> stack
        </h1>
        <p className="max-w-2xl text-base text-zinc-400 sm:text-lg">
          Practice buys and sells against a ticking market. Wallet, market, and
          portfolio each run as their own Spring Boot service — the UI only
          talks REST.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <ShimmerButton
            shimmerColor="#ffffff"
            background="rgb(52 211 153)"
            className="font-semibold text-zinc-950 shadow-none"
            onClick={() => router.push("/login")}
          >
            Log in to trade
          </ShimmerButton>
          <Link
            href="/market"
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 underline-offset-4 hover:text-zinc-50 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
          >
            Browse the market
          </Link>
        </div>
      </div>
    </section>
  );
}
