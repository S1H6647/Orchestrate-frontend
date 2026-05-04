import { apiRequest } from "@/lib/api/http";
import { OrganizationResponse, Page, UserResponse } from "@/lib/api/types";

export type AdminListParams = {
  page?: number;
  size?: number;
  sortBy?: string;
  q?: string;
};

export function getAdminUsers(params: AdminListParams) {
  return apiRequest<Page<UserResponse>>("/users/all", { auth: true, search: params });
}

export function getAdminOrganizations(params: AdminListParams) {
  return apiRequest<Page<OrganizationResponse>>("/organizations/all", { auth: true, search: params });
}
