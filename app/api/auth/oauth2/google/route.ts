import { NextRequest, NextResponse } from "next/server";
import { BACKEND_ORIGIN } from "@/lib/api/backend";

export async function GET(request: NextRequest) {
  const redirectUri = new URL("/oauth2/callback", request.nextUrl.origin).toString();
  const authorizeUrl = new URL(`${BACKEND_ORIGIN}/oauth2/authorize/google`);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  return NextResponse.redirect(authorizeUrl);
}
