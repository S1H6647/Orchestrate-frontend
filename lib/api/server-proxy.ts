import { NextRequest } from "next/server";
import { BACKEND_ORIGIN, createBackendUrl } from "@/lib/api/backend";
import { AUTH_BASE_PATH, SESSION_ACCESS_COOKIE, SESSION_REFRESH_COOKIE } from "@/lib/api/constants";

type ProxyOptions = {
  allowAuthRetry?: boolean;
};

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

async function parseJsonSafe(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }
  return response.json();
}

function cleanResponseHeaders(headers: Headers) {
  const clean = new Headers(headers);
  // Strip hop-by-hop and encoding headers that might conflict with Next.js re-packaging
  [
    "content-encoding",
    "content-length",
    "transfer-encoding",
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "upgrade"
  ].forEach(h => clean.delete(h));
  return clean;
}

async function executeUpstream(url: URL, options: RequestInit) {
  try {
    return await fetch(url.toString(), options);
  } catch {
    return Response.json(
      {
        success: false,
        status: 502,
        error: "Internal Server Error",
        message: "Upstream API unavailable",
        timestamp: new Date().toISOString(),
      },
      { status: 502 },
    );
  }
}

async function refreshIfNeeded(request: NextRequest) {
  const refreshToken = request.cookies.get(SESSION_REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return null;
  }

  const refreshUrl = createBackendUrl(`${AUTH_BASE_PATH}/refresh-token`);
  refreshUrl.searchParams.set("refreshToken", refreshToken);

  const refreshResponse = await fetch(refreshUrl.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!refreshResponse.ok) {
    return null;
  }
  return (await parseJsonSafe(refreshResponse)) as {
    accessToken: string;
    refreshToken: string;
    id: string;
    name: string;
    email: string;
  } | null;
}

export async function proxyToBackend(
  request: NextRequest,
  endpoint: string,
  method: string,
  options: ProxyOptions = {},
) {
  const { allowAuthRetry = true } = options;
  const rawPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const path = rawPath === `${AUTH_BASE_PATH}` ? `${AUTH_BASE_PATH}/` : rawPath;
  const url = createBackendUrl(path, request.nextUrl.searchParams);

  if (process.env.NODE_ENV === "production") {
    console.log(`[Proxy] ${method} ${request.nextUrl.pathname} -> ${url.toString()}`);
  }

  if (path === `${AUTH_BASE_PATH}/` && !url.searchParams.has("refreshToken")) {
    const refreshToken = request.cookies.get(SESSION_REFRESH_COOKIE)?.value;
    if (refreshToken) {
      url.searchParams.set("refreshToken", refreshToken);
    }
  }

  const headers = new Headers({
    Accept: "application/json",
  });

  const accessToken = request.cookies.get(SESSION_ACCESS_COOKIE)?.value;
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  const authHeader = request.headers.get("x-orchestrate-auth");
  const requiresAuth = authHeader === "required";

  let body: BodyInit | undefined;
  if (method !== "GET") {
    const raw = await request.arrayBuffer();
    body = raw.byteLength > 0 ? raw : undefined;
  }

  const execute = async (token?: string) => {
    const forwardHeaders = new Headers(headers);
    if (token) {
      forwardHeaders.set("Authorization", `Bearer ${token}`);
    }

    return executeUpstream(url, {
      method,
      headers: forwardHeaders,
      body,
      cache: "no-store",
    });
  };

  let response = await execute();

  if (response.status === 401 && requiresAuth && allowAuthRetry) {
    const refreshed = await refreshIfNeeded(request);
    if (!refreshed) {
      const unauthorized = Response.json(
        {
          success: false,
          status: 401,
          error: "Unauthorized",
          message: "Session expired",
          timestamp: new Date().toISOString(),
        },
        { status: 401 },
      );
      unauthorized.headers.append(
        "Set-Cookie",
        `${SESSION_ACCESS_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
      );
      unauthorized.headers.append(
        "Set-Cookie",
        `${SESSION_REFRESH_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
      );
      return unauthorized;
    }

    response = await execute(refreshed.accessToken);

    const proxyResponse = new Response(await response.arrayBuffer(), {
      status: response.status,
      headers: cleanResponseHeaders(response.headers),
    });

    proxyResponse.headers.append(
      "Set-Cookie",
      `${SESSION_ACCESS_COOKIE}=${refreshed.accessToken}; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
    );
    proxyResponse.headers.append(
      "Set-Cookie",
      `${SESSION_REFRESH_COOKIE}=${refreshed.refreshToken}; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
    );

    return proxyResponse;
  }

  if (path === `${AUTH_BASE_PATH}/login` && response.ok) {
    const payload = (await parseJsonSafe(response)) as {
      accessToken: string;
      refreshToken: string;
      id: string;
      name: string;
      email: string;
    };

    const next = Response.json(payload, { status: response.status });
    const options = cookieOptions();
    next.headers.append(
      "Set-Cookie",
      `${SESSION_ACCESS_COOKIE}=${payload.accessToken}; Path=${options.path}; HttpOnly; SameSite=Lax${options.secure ? "; Secure" : ""}`,
    );
    next.headers.append(
      "Set-Cookie",
      `${SESSION_REFRESH_COOKIE}=${payload.refreshToken}; Path=${options.path}; HttpOnly; SameSite=Lax${options.secure ? "; Secure" : ""}`,
    );
    return next;
  }

  if (path === `${AUTH_BASE_PATH}/`) {
    const next = new Response(await response.arrayBuffer(), {
      status: response.status,
      headers: cleanResponseHeaders(response.headers),
    });
    next.headers.append(
      "Set-Cookie",
      `${SESSION_ACCESS_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
    );
    next.headers.append(
      "Set-Cookie",
      `${SESSION_REFRESH_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
    );
    return next;
  }

  return new Response(await response.arrayBuffer(), {
    status: response.status,
    headers: cleanResponseHeaders(response.headers),
  });
}

export function getBackendOrigin() {
  return BACKEND_ORIGIN;
}
