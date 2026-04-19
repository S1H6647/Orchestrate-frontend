export const API_BASE_PATH = "/api/v1";
export const AUTH_BASE_PATH = "/auth";

export const SESSION_ACCESS_COOKIE = "orchestrate_access_token";
export const SESSION_REFRESH_COOKIE = "orchestrate_refresh_token";

export const PUBLIC_ROUTES = ["/login", "/register", "/verify"] as const;

export const MEMBER_ROLE_LEVEL: Record<string, number> = {
  OWNER: 4,
  ADMIN: 3,
  MEMBER: 2,
  VIEWER: 1,
};
