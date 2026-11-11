import { Suspense } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { BrandedPanel } from "@/components/auth/branded-panel";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginPage() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-zinc-950 px-4 py-10">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-2 lg:items-stretch">
        <BrandedPanel />
        <div className="flex items-center">
          <div className="w-full max-w-md lg:ml-auto">
            <Suspense
              fallback={
                <Skeleton className="h-[420px] w-full rounded-xl border border-zinc-800" />
              }
            >
              <AuthCard />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
