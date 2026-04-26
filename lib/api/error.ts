import { ApiErrorResponse } from "@/lib/api/types";

export class ApiClientError extends Error {
  status: number;
  code: ApiErrorResponse["error"] | "Unknown";
  details?: Record<string, string>;
  __isApiClientError = true;

  constructor(message: string, status: number, code: any, details?: any) {
    const safeMessage = typeof message === "string" ? message : "An unexpected error occurred";
    super(safeMessage);
    this.name = "ApiClientError";
    this.status = typeof status === "number" ? status : 500;
    this.code = (typeof code === "string" ? code : "Unknown") as any;
    this.details = (details && typeof details === "object") ? details : undefined;
    
    Object.setPrototypeOf(this, ApiClientError.prototype);
  }
}

export function normalizeError(payload: unknown, status: number, fallback: string) {
  if (!payload || typeof payload !== "object") {
    const message = typeof payload === "string" ? payload : `${fallback} (${status})`;
    return new ApiClientError(message, status, "Unknown");
  }

  // Handle case where payload might be an Error-like object but not match ApiErrorResponse
  const parsed = payload as any;
  
  // If it's a standard error object with a message
  const message = parsed.message || parsed.error_description || fallback;
  const errorCode = parsed.error || parsed.code || "Unknown";
  const errors = parsed.errors || undefined;

  const safeMessage = typeof message === "string" ? message : fallback;
  const safeStatus = typeof parsed.status === "number" ? parsed.status : status;
  const safeCode = typeof errorCode === "string" ? errorCode : "Unknown";

  return new ApiClientError(safeMessage, safeStatus, safeCode, errors);
}
