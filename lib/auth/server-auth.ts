import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_ACCESS_COOKIE, SESSION_REFRESH_COOKIE } from "@/lib/api/constants";

export async function requireAuth() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(SESSION_ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(SESSION_REFRESH_COOKIE)?.value;

  if (!accessToken && !refreshToken) {
    redirect("/login");
  }

  return {
    accessToken,
    refreshToken,
  };
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return Boolean(
    cookieStore.get(SESSION_ACCESS_COOKIE)?.value || cookieStore.get(SESSION_REFRESH_COOKIE)?.value,
  );
}
