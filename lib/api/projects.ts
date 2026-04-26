import { apiRequest } from "@/lib/api/http";
import {
  CreateProjectRequest,
  ProjectResponse,
  UpdateProjectRequest,
  ProjectMember,
  AddProjectMemberRequest,
} from "@/lib/api/types";

export function getProjects(organizationId: string) {
  return apiRequest<ProjectResponse[]>(`/organizations/${organizationId}/projects`, {
    auth: true,
  });
}

export function getProject(organizationId: string, projectSlug: string) {
  return apiRequest<ProjectResponse>(`/organizations/${organizationId}/projects/${projectSlug}`, {
    auth: true,
  });
}

export function createProject(organizationId: string, input: CreateProjectRequest) {
  return apiRequest<ProjectResponse>(`/organizations/${organizationId}/projects`, {
    method: "POST",
    body: input,
    auth: true,
  });
}

export function updateProject(organizationId: string, projectSlug: string, input: UpdateProjectRequest) {
  return apiRequest<ProjectResponse>(`/organizations/${organizationId}/projects/${projectSlug}`, {
    method: "PATCH",
    body: input,
    auth: true,
  });
}

export function archiveProject(organizationId: string, projectSlug: string) {
  return apiRequest<void>(`/organizations/${organizationId}/projects/${projectSlug}/archive`, {
    method: "PATCH",
    auth: true,
  });
}

export function getProjectMembers(organizationId: string, projectSlug: string) {
  return apiRequest<ProjectMember[]>(`/organizations/${organizationId}/projects/${projectSlug}/members`, {
    auth: true,
  });
}

export function addProjectMember(organizationId: string, projectSlug: string, input: AddProjectMemberRequest) {
  return apiRequest<ProjectMember>(`/organizations/${organizationId}/projects/${projectSlug}/members`, {
    method: "POST",
    body: input,
    auth: true,
  });
}

export function removeProjectMember(organizationId: string, projectSlug: string, userId: string) {
  return apiRequest<void>(`/organizations/${organizationId}/projects/${projectSlug}/members/${userId}`, {
    method: "DELETE",
    auth: true,
  });
}

export function deleteProject(organizationId: string, projectSlug: string, confirmation: UpdateProjectRequest) {
  return apiRequest<void>(`/organizations/${organizationId}/projects/${projectSlug}`, {
    method: "DELETE",
    body: confirmation,
    auth: true,
  });
}
