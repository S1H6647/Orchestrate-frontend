"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminUsers, AdminListParams } from "@/lib/api/admin";
import { adminQueryKeys } from "@/hooks/queries/query-keys";

const DEFAULTS = { page: 0, size: 20, q: "", sortBy: "createdAt,DESC" };

export function useUsersQuery(params: AdminListParams, enabled = true) {
  const merged = { ...DEFAULTS, ...params };
  return useQuery({
    queryKey: adminQueryKeys.users(merged.page ?? 0, merged.size ?? 20, merged.q ?? ""),
    queryFn: () => getAdminUsers(merged),
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function usePrefetchUsers() {
  const queryClient = useQueryClient();
  return (params: AdminListParams) => {
    const merged = { ...DEFAULTS, ...params };
    return queryClient.prefetchQuery({
      queryKey: adminQueryKeys.users(merged.page ?? 0, merged.size ?? 20, merged.q ?? ""),
      queryFn: () => getAdminUsers(merged),
      staleTime: 1000 * 60 * 5,
    });
  };
}
