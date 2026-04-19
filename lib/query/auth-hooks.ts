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
    retry: false,
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
