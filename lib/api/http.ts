import { ApiClientError, normalizeError } from "@/lib/api/error";

type RequestConfig = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  search?: Record<string, string | number | boolean | undefined | null>;
  auth?: boolean;
};

function buildPath(path: string, search?: RequestConfig["search"]) {
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(`/api/proxy/${normalized}`, window.location.origin);
  if (search) {
    for (const [key, value] of Object.entries(search)) {
      if (value === undefined || value === null || value === "") {
        continue;
      }
      url.searchParams.set(key, String(value));
    }
  }
  return url.pathname + url.search;
}

export async function apiRequest<T>(path: string, config: RequestConfig = {}): Promise<T> {
  const { method = "GET", body, search, auth = false } = config;

  if (typeof window === "undefined") {
    throw new ApiClientError("Client API called on server", 500, "Internal Server Error");
  }

  const headers = new Headers({
    Accept: "application/json",
  });
  if (auth) {
    headers.set("x-orchestrate-auth", "required");
  }

  let requestBody: BodyInit | undefined;
  if (body instanceof FormData) {
    requestBody = body;
  } else if (body !== undefined) {
    headers.set("Content-Type", "application/json");
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(buildPath(path, search), {
    method,
    credentials: "include",
    headers,
    body: requestBody,
  });

  const contentType = response.headers.get("content-type") ?? "";
  let payload: unknown = null;
  if (contentType.includes("application/json") && response.status !== 204) {
    const text = await response.text();
    payload = text ? JSON.parse(text) : null;
  }

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw normalizeError(payload, response.status, "Request failed");
  }

  if (response.status === 204) {
    return null as T;
  }

  return payload as T;
}
