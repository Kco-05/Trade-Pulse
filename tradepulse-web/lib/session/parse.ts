import type { SessionPayload } from "@/lib/session/types";

export const TP_UID_COOKIE = "tp_uid";

export function encodeSession(payload: SessionPayload): string {
  return JSON.stringify({
    userId: payload.userId,
    username: payload.username,
  });
}

export function parseSession(raw: string | undefined): SessionPayload | null {
  if (!raw) {
    return null;
  }

  try {
    const data = JSON.parse(raw) as Partial<SessionPayload>;
    if (
      typeof data.userId !== "number" ||
      !Number.isInteger(data.userId) ||
      data.userId <= 0 ||
      typeof data.username !== "string" ||
      data.username.length === 0
    ) {
      return null;
    }
    return { userId: data.userId, username: data.username };
  } catch {
    return null;
  }
}
