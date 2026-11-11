"use client";

import { create } from "zustand";

import type { SessionPayload } from "@/lib/session/types";

export type SessionStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "anonymous";

type SessionState = {
  userId: number | null;
  username: string | null;
  status: SessionStatus;
  setSession: (payload: SessionPayload) => void;
  clearSession: () => void;
  hydrateFromServer: (payload: SessionPayload | null) => void;
  beginHydration: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  userId: null,
  username: null,
  status: "idle",
  setSession: (payload) =>
    set({
      userId: payload.userId,
      username: payload.username,
      status: "authenticated",
    }),
  clearSession: () =>
    set({
      userId: null,
      username: null,
      status: "anonymous",
    }),
  hydrateFromServer: (payload) => {
    if (!payload) {
      set({
        userId: null,
        username: null,
        status: "anonymous",
      });
      return;
    }
    set({
      userId: payload.userId,
      username: payload.username,
      status: "authenticated",
    });
  },
  beginHydration: () => set({ status: "loading" }),
}));
