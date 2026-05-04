"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminOrganizations, AdminListParams } from "@/lib/api/admin";
import { adminQueryKeys } from "@/hooks/queries/query-keys";

const DEFAULTS = { page: 0, size: 20, q: "", sortBy: "createdAt,DESC" };

export function useOrganizationsQuery(params: AdminListParams, enabled = true) {
  const merged = { ...DEFAULTS, ...params };
  return useQuery({
    queryKey: adminQueryKeys.organizations(merged.page ?? 0, merged.size ?? 20, merged.q ?? ""),
    queryFn: () => getAdminOrganizations(merged),
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function usePrefetchOrganizations() {
  const queryClient = useQueryClient();
  return (params: AdminListParams) => {
    const merged = { ...DEFAULTS, ...params };
    return queryClient.prefetchQuery({
      queryKey: adminQueryKeys.organizations(merged.page ?? 0, merged.size ?? 20, merged.q ?? ""),
      queryFn: () => getAdminOrganizations(merged),
      staleTime: 1000 * 60 * 5,
    });
  };
}
