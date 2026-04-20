import { NextRequest, NextResponse } from "next/server";
import { PUBLIC_ROUTES, SESSION_ACCESS_COOKIE, SESSION_REFRESH_COOKIE } from "@/lib/api/constants";

function isPublic(pathname: string) {
  if (pathname.startsWith("/verify")) {
    return true;
  }
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function hasSession(request: NextRequest) {
  return Boolean(
    request.cookies.get(SESSION_ACCESS_COOKIE)?.value ||
      request.cookies.get(SESSION_REFRESH_COOKIE)?.value,
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  const loggedIn = hasSession(request);
  const publicRoute = isPublic(pathname);

  if (!loggedIn && !publicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL(loggedIn ? "/organizations" : "/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.png$).*)"],
};
