"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  getMe,
  login,
  logout,
  register,
  resendVerification,
  verifyAccount,
} from "@/lib/api/auth";
import { queryKeys } from "@/lib/query/keys";
import { clearSession, setSessionFromLogin, setSessionUser } from "@/lib/session/client-session";

export function useMeQuery(enabled = true) {
  const query = useQuery({
    queryKey: queryKeys.me,
    queryFn: getMe,
    enabled,
    // Retry once so a transient network error during the proxy's 401→refresh
    // round-trip doesn't immediately clear the user display name.
    retry: 1,
    // Fire every 10 min to keep the session alive before the 15-min token expires.
    // On each interval the proxy transparently refreshes the token if needed.
    staleTime: 1000 * 60 * 10,
    refetchInterval: 1000 * 60 * 10,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
  });

  useEffect(() => {
    if (query.data) {
      setSessionUser(query.data);
    }
  }, [query.data]);

  useEffect(() => {
    if (query.error) {
      setSessionUser(null);
    }
  }, [query.error]);

  return query;
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: (payload) => {
      setSessionFromLogin(payload);
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: register,
  });
}

export function useVerifyMutation() {
  return useMutation({
    mutationFn: verifyAccount,
  });
}

export function useResendVerificationMutation() {
  return useMutation({
    mutationFn: resendVerification,
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearSession();
      setSessionUser(null);
      queryClient.clear();
    },
  });
}
