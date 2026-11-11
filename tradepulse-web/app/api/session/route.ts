import { NextResponse } from "next/server";

import {
  clearSessionCookie,
  readSessionCookie,
  setSessionCookie,
} from "@/lib/session/cookie";
import type { SessionPayload } from "@/lib/session/types";

type SessionBody = {
  userId?: unknown;
  username?: unknown;
};

function parseBody(body: SessionBody): SessionPayload | null {
  if (
    typeof body.userId !== "number" ||
    !Number.isInteger(body.userId) ||
    body.userId <= 0 ||
    typeof body.username !== "string" ||
    body.username.trim().length === 0
  ) {
    return null;
  }

  return {
    userId: body.userId,
    username: body.username.trim(),
  };
}

export async function GET() {
  const session = await readSessionCookie();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json(session);
}

export async function POST(request: Request) {
  let body: SessionBody;
  try {
    body = (await request.json()) as SessionBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const payload = parseBody(body);
  if (!payload) {
    return NextResponse.json(
      { error: "userId and username are required" },
      { status: 400 },
    );
  }

  await setSessionCookie(payload);
  return NextResponse.json(payload);
}

export async function DELETE() {
  await clearSessionCookie();
  return new NextResponse(null, { status: 204 });
}
