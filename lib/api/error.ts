import { ApiErrorResponse } from "@/lib/api/types";

export class ApiClientError extends Error {
  status: number;
  code: ApiErrorResponse["error"] | "Unknown";
  details?: Record<string, string>;

  constructor(message: string, status: number, code: ApiClientError["code"], details?: Record<string, string>) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function normalizeError(payload: unknown, status: number, fallback: string) {
  if (!payload || typeof payload !== "object") {
    const message = typeof payload === "string" ? payload : fallback;
    return new ApiClientError(message, status, "Unknown");
  }
  const parsed = payload as Partial<ApiErrorResponse>;
  return new ApiClientError(
    parsed.message ?? fallback,
    parsed.status ?? status,
    parsed.error ?? "Unknown",
    parsed.errors,
  );
}
