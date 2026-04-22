import { NextRequest, NextResponse } from "next/server";
import { SESSION_ACCESS_COOKIE } from "@/lib/api/constants";

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return Response.json(
      {
        success: false,
        status: 400,
        error: "Bad Request",
        message: "Missing OAuth token",
        timestamp: new Date().toISOString(),
      },
      { status: 400 },
    );
  }

  const next = Response.json({ success: true });
  const options = cookieOptions();
  next.headers.append(
    "Set-Cookie",
    `${SESSION_ACCESS_COOKIE}=${token}; Path=${options.path}; HttpOnly; SameSite=Lax${options.secure ? "; Secure" : ""}`,
  );
  return next;
}

export async function DELETE() {
  const next = NextResponse.json({ success: true });
  next.headers.append(
    "Set-Cookie",
    `${SESSION_ACCESS_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  );
  return next;
}
