import { apiRequest } from "@/lib/api/http";
import { Page, UserDetailResponse, UserResponse } from "@/lib/api/types";

export type GetUsersParams = {
  page?: number;
  size?: number;
  sortBy?: string;
  q?: string;
};

export function getAllUsers(params: GetUsersParams = {}) {
  return apiRequest<Page<UserResponse>>("/users/all", { auth: true, search: params });
}

export function getUserById(userId: string) {
  return apiRequest<UserDetailResponse>(`/users/${userId}`, { auth: true });
}
