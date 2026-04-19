"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptOrganizationInvitation,
  cancelInvitation,
  createOrganization,
  declineInvitation,
  deleteOrganization,
  getAllOrganizations,
  getMyOrganizationContext,
  getMyOrganizations,
  getOrganization,
  getOrganizationInvitations,
  getOrganizationMembers,
  inviteOrganizationMember,
  resendInvitation,
  restoreMember,
  softRemoveMember,
  transferOwnership,
  updateMemberRole,
  updateOrganizationIdentity,
  updateOrganizationProfile,
  validateInvitation,
} from "@/lib/api/organizations";
import { queryKeys } from "@/lib/query/keys";

export function useMyOrganizationsQuery() {
  return useQuery({
    queryKey: queryKeys.organizations,
    queryFn: getMyOrganizations,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,
  });
}

export function useAllOrganizationsQuery(enabled = false) {
  return useQuery({
    queryKey: [...queryKeys.organizations, "all"],
    queryFn: getAllOrganizations,
    enabled,
  });
}

export function useOrganizationQuery(organizationId: string) {
  return useQuery({
    queryKey: queryKeys.organization(organizationId),
    queryFn: () => getOrganization(organizationId),
    enabled: !!organizationId,
  });
}

export function useOrganizationMembersQuery(organizationId: string) {
  return useQuery({
    queryKey: queryKeys.members(organizationId),
    queryFn: () => getOrganizationMembers(organizationId),
    enabled: !!organizationId,
  });
}

export function useOrganizationInvitationsQuery(organizationId: string) {
  return useQuery({
    queryKey: queryKeys.invitations(organizationId),
    queryFn: () => getOrganizationInvitations(organizationId),
    enabled: !!organizationId,
  });
}

export function useMyOrganizationContextQuery() {
  return useQuery({
    queryKey: queryKeys.myOrganizationContext,
    queryFn: getMyOrganizationContext,
  });
}

export function useCreateOrganizationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, image }: { payload: Parameters<typeof createOrganization>[0]; image?: File | null }) =>
      createOrganization(payload, image),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations });
    },
  });
}

export function useUpdateOrganizationProfileMutation(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, image }: { payload: Parameters<typeof updateOrganizationProfile>[1]; image?: File | null }) =>
      updateOrganizationProfile(organizationId, payload, image),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organization(organizationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations });
    },
  });
}

export function useUpdateOrganizationIdentityMutation(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof updateOrganizationIdentity>[1]) =>
      updateOrganizationIdentity(organizationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organization(organizationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations });
    },
  });
}

export function useDeleteOrganizationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ organizationId, confirmation }: { organizationId: string; confirmation: string }) =>
      deleteOrganization(organizationId, confirmation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations });
    },
  });
}

export function useTransferOwnershipMutation(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newOwnerUserId: string) => transferOwnership(organizationId, newOwnerUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organization(organizationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.members(organizationId) });
    },
  });
}

export function useInviteMemberMutation(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof inviteOrganizationMember>[1]) =>
      inviteOrganizationMember(organizationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations(organizationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.members(organizationId) });
    },
  });
}

export function useUpdateRoleMutation(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER" }) =>
      updateMemberRole(organizationId, userId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members(organizationId) });
    },
  });
}

export function useRemoveMemberMutation(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => softRemoveMember(organizationId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members(organizationId) });
    },
  });
}

export function useRestoreMemberMutation(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => restoreMember(organizationId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members(organizationId) });
    },
  });
}

export function useResendInvitationMutation(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => resendInvitation(organizationId, inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations(organizationId) });
    },
  });
}

export function useCancelInvitationMutation(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => cancelInvitation(organizationId, inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations(organizationId) });
    },
  });
}

export function useValidateInvitationMutation() {
  return useMutation({
    mutationFn: validateInvitation,
  });
}

export function useAcceptInvitationMutation() {
  return useMutation({
    mutationFn: acceptOrganizationInvitation,
  });
}

export function useDeclineInvitationMutation() {
  return useMutation({
    mutationFn: declineInvitation,
  });
}
export function useOrganizationBySlug(slug?: string) {
  const { data: organizations, isLoading, isError } = useMyOrganizationsQuery();
  const organization = organizations?.find((o) => o.slug === slug);

  return {
    data: organization,
    isLoading: isLoading,
    isError: isError || (!isLoading && !!slug && !organization),
  };
}
