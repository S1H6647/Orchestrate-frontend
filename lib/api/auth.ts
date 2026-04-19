import { apiRequest } from "@/lib/api/http";
import {
  AuthUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  SuccessResponse,
} from "@/lib/api/types";

export function register(input: RegisterRequest) {
  return apiRequest<RegisterResponse>("/auth/register", {
    method: "POST",
    body: input,
  });
}

export function login(input: LoginRequest) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: input,
  });
}

export function verifyAccount(token: string) {
  return apiRequest<SuccessResponse>("/auth/verify", {
    search: { token },
  });
}

export function resendVerification(email: string) {
  return apiRequest<SuccessResponse>("/auth/resend-verification", {
    search: { email },
  });
}

export function refreshToken(refreshToken: string) {
  return apiRequest<LoginResponse>("/auth/refresh-token", {
    search: { refreshToken },
  });
}

export function logout() {
  return apiRequest<SuccessResponse>("/auth", {
    method: "GET",
  });
}

export function getMe() {
  return apiRequest<AuthUser>("/auth/me", {
    auth: true,
  });
}
