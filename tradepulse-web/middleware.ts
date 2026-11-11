import { NextResponse, type NextRequest } from "next/server";

import { parseSession, TP_UID_COOKIE } from "@/lib/session/parse";

export function middleware(request: NextRequest) {
  const raw = request.cookies.get(TP_UID_COOKIE)?.value;
  const session = parseSession(raw);

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portfolio/:path*", "/history/:path*"],
};
