import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_ACCESS_COOKIE } from "@/lib/api/constants";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(SESSION_ACCESS_COOKIE)?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ accessToken });
}
