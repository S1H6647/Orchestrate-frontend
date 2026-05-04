"use client";

import { useQuery } from "@tanstack/react-query";
import { GetUsersParams, getAllUsers, getUserById } from "@/lib/api/users";
import { queryKeys } from "@/lib/query/keys";

export function useAllUsersQuery(params: GetUsersParams, enabled = false) {
  return useQuery({
    queryKey: [...queryKeys.users, "all", params],
    queryFn: () => getAllUsers(params),
    enabled,
  });
}

export function useUserQuery(userId?: string, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.users, userId],
    queryFn: () => getUserById(userId as string),
    enabled: !!userId && enabled,
  });
}
