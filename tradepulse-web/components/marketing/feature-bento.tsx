import {
  Boxes,
  Lock,
  RefreshCw,
  Layers,
} from "lucide-react";

import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";

const features = [
  {
    name: "Microservice Architecture",
    description:
      "Three Spring Boot services on ports 8081–8083 — wallet, market, and portfolio — each with its own H2 database.",
    href: "/market",
    cta: "Open market",
    Icon: Boxes,
    className: "lg:col-span-2",
  },
  {
    name: "Real-time execution",
    description:
      "Prices refresh on a 5-second simulated poll so the dashboard tracks the same tick cadence as the backend scheduler.",
    href: "/market",
    cta: "Watch ticks",
    Icon: RefreshCw,
    className: "lg:col-span-1",
  },
  {
    name: "Secure Sessions",
    description:
      "Login sets an HTTP-only Next.js session cookie. Browser calls stay on the same origin; rewrites proxy to Spring.",
    href: "/login",
    cta: "Sign in",
    Icon: Lock,
    className: "lg:col-span-1",
  },
  {
    name: "Modern Stack",
    description:
      "Next.js App Router, Tailwind, and Zustand for session state — a thin UI over typed REST hooks.",
    href: "/signup",
    cta: "Create account",
    Icon: Layers,
    className: "lg:col-span-2",
  },
] as const;

export function FeatureBento() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="mb-8 max-w-2xl">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
          Built like a real trading lab
        </h2>
        <p className="mt-2 text-sm text-zinc-400 sm:text-base">
          Honest architecture for examiners: separate services, proxied APIs,
          and a public market with login-gated trades.
        </p>
      </div>

      <BentoGrid className="grid-cols-1 auto-rows-[18rem] sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <BentoCard
            key={feature.name}
            name={feature.name}
            description={feature.description}
            href={feature.href}
            cta={feature.cta}
            Icon={feature.Icon}
            className={feature.className}
            background={
              <div
                className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.12),transparent_55%)]"
                aria-hidden
              />
            }
          />
        ))}
      </BentoGrid>
    </section>
  );
}
