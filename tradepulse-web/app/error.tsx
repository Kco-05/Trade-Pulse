"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-950 px-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-sm text-zinc-400">
        {error.message || "An unexpected error stopped this page from loading."}
      </p>
      <Button className="mt-8" size="lg" onClick={() => reset()}>
        Try again
      </Button>
    </main>
  );
}
