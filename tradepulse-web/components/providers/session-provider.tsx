"use client";

import { useEffect } from "react";

import { fetchSession } from "@/lib/session/client";
import { useSessionStore } from "@/lib/stores/session";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const beginHydration = useSessionStore((s) => s.beginHydration);
  const hydrateFromServer = useSessionStore((s) => s.hydrateFromServer);

  useEffect(() => {
    let cancelled = false;

    beginHydration();
    void fetchSession().then((session) => {
      if (!cancelled) {
        hydrateFromServer(session);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [beginHydration, hydrateFromServer]);

  return children;
}
