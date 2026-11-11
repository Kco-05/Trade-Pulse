import type { SessionPayload } from "@/lib/session/types";

export async function fetchSession(): Promise<SessionPayload | null> {
  const response = await fetch("/api/session", {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as SessionPayload;
}

export async function createSession(
  payload: SessionPayload,
): Promise<SessionPayload> {
  const response = await fetch("/api/session", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create session");
  }

  return (await response.json()) as SessionPayload;
}

export async function destroySession(): Promise<void> {
  await fetch("/api/session", {
    method: "DELETE",
    credentials: "same-origin",
  });
}
