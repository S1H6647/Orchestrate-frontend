import { apiRequest } from "@/lib/api/http";
import {
  CreateOrganizationRequest,
  InvitationAcceptResponse,
  InvitationResponse,
  InviteMemberRequest,
  OrganizationMember,
  OrganizationResponse,
  OrganizationSummary,
  SuccessResponse,
  UpdateMemberRoleRequest,
  UpdateOrganizationIdentityRequest,
  UpdateOrganizationProfileRequest,
} from "@/lib/api/types";

export function getAllOrganizations() {
  return apiRequest<OrganizationResponse[]>("/organizations/all", { auth: true });
}

export function getMyOrganizations() {
  return apiRequest<OrganizationResponse[]>("/organizations/my-organizations", { auth: true });
}

export function createOrganization(input: CreateOrganizationRequest, image?: File | null) {
  const formData = new FormData();
  formData.append("request", new Blob([JSON.stringify(input)], { type: "application/json" }));
  if (image) {
    formData.append("image", image);
  }

  return apiRequest<OrganizationResponse>("/organizations", {
    method: "POST",
    body: formData,
    auth: true,
  });
}

export function getOrganization(organizationId: string) {
  return apiRequest<OrganizationResponse>(`/organizations/${organizationId}`, { auth: true });
}

export function getOrganizationMembers(organizationId: string) {
  return apiRequest<OrganizationMember[]>(`/organizations/${organizationId}/members`, { auth: true });
}

export function deleteOrganization(organizationId: string, confirmation: string) {
  return apiRequest<void>("/organizations", {
    method: "DELETE",
    search: { organizationId },
    body: { confirmation },
    auth: true,
  });
}

export function getMyOrganizationContext() {
  return apiRequest<OrganizationSummary>("/organizations/me", { auth: true });
}

export function updateOrganizationProfile(
  organizationId: string,
  input: UpdateOrganizationProfileRequest,
  image?: File | null,
) {
  const formData = new FormData();
  formData.append("request", new Blob([JSON.stringify(input)], { type: "application/json" }));
  if (image) {
    formData.append("image", image);
  }

  return apiRequest<OrganizationResponse>(`/organizations/${organizationId}/profile`, {
    method: "PATCH",
    body: formData,
    auth: true,
  });
}

export function updateOrganizationIdentity(
  organizationId: string,
  input: UpdateOrganizationIdentityRequest,
) {
  return apiRequest<OrganizationResponse>(`/organizations/${organizationId}/identity`, {
    method: "PATCH",
    body: input,
    auth: true,
  });
}

export function inviteOrganizationMember(organizationId: string, input: InviteMemberRequest) {
  return apiRequest<SuccessResponse>(`/organizations/${organizationId}/invitations`, {
    method: "POST",
    body: input,
    auth: true,
  });
}

export function acceptOrganizationInvitation(token: string) {
  return apiRequest<InvitationAcceptResponse>("/organizations/invitations/accept", {
    search: { token },
    auth: true,
  });
}

export function softRemoveMember(organizationId: string, userId: string) {
  return apiRequest<void>(`/organizations/${organizationId}/members/${userId}`, {
    method: "PATCH",
    auth: true,
  });
}

export function updateMemberRole(
  organizationId: string,
  userId: string,
  input: UpdateMemberRoleRequest,
) {
  return apiRequest<void>(`/organizations/${organizationId}/members/${userId}/role`, {
    method: "PATCH",
    body: input,
    auth: true,
  });
}

export function restoreMember(organizationId: string, userId: string) {
  return apiRequest<void>(`/organizations/${organizationId}/members/${userId}/restore`, {
    method: "POST",
    auth: true,
  });
}

export function getOrganizationInvitations(organizationId: string) {
  return apiRequest<InvitationResponse[]>(`/organizations/${organizationId}/invitations`, {
    auth: true,
  });
}

export function resendInvitation(organizationId: string, inviteId: string) {
  return apiRequest<InvitationResponse>(`/organizations/${organizationId}/invitations/${inviteId}/resend`, {
    method: "POST",
    auth: true,
  });
}

export function cancelInvitation(organizationId: string, inviteId: string) {
  return apiRequest<void>(`/organizations/${organizationId}/invitations/${inviteId}`, {
    method: "DELETE",
    auth: true,
  });
}

export function declineInvitation(token: string) {
  return apiRequest<void>(`/organizations/invitations/${token}/decline`, {
    method: "POST",
    auth: true,
  });
}

export function validateInvitation(token: string) {
  return apiRequest<SuccessResponse>(`/organizations/invitations/${token}/validate`, {
    method: "POST",
    auth: true,
  });
}

export function transferOwnership(organizationId: string, newOwnerUserId: string) {
  return apiRequest<void>(`/organizations/${organizationId}/transfer-ownership`, {
    method: "POST",
    body: { newOwnerUserId },
    auth: true,
  });
}
