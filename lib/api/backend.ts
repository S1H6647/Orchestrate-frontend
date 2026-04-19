import { API_BASE_PATH } from "@/lib/api/constants";

export const BACKEND_ORIGIN = (process.env.BACKEND_API_ORIGIN ?? "http://localhost:8081").replace(/\/+$/, "");

function normalizePath(path: string) {
  const prefix = API_BASE_PATH.replace(/\/+$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${prefix}${suffix}`;
}

export function createBackendUrl(path: string, search?: URLSearchParams) {
  const url = new URL(`${BACKEND_ORIGIN}${normalizePath(path)}`);
  if (search) {
    search.forEach((value, key) => {
      url.searchParams.append(key, value);
    });
  }
  return url;
}
