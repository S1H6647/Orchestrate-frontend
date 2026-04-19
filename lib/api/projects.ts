import { apiRequest } from "@/lib/api/http";
import { CreateProjectRequest, ProjectResponse } from "@/lib/api/types";

export function createProject(organizationId: string, input: CreateProjectRequest) {
  return apiRequest<ProjectResponse>(`/organizations/${organizationId}/projects`, {
    method: "POST",
    body: input,
    auth: true,
  });
}

export function listProjects(organizationId: string) {
  return apiRequest<ProjectResponse[]>(`/organizations/${organizationId}/projects`, {
    auth: true,
  });
}
