import { cookies } from "next/headers";

import {
  encodeSession,
  parseSession,
  TP_UID_COOKIE,
} from "@/lib/session/parse";
import type { SessionPayload } from "@/lib/session/types";

export { encodeSession, parseSession, TP_UID_COOKIE };
export type { SessionPayload };

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

export async function readSessionCookie(): Promise<SessionPayload | null> {
  const jar = await cookies();
  return parseSession(jar.get(TP_UID_COOKIE)?.value);
}

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const jar = await cookies();
  jar.set(TP_UID_COOKIE, encodeSession(payload), cookieOptions);
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(TP_UID_COOKIE);
}
