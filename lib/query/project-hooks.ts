"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  archiveProject,
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
  deleteProject,
} from "@/lib/api/projects";
import { queryKeys } from "@/lib/query/keys";
import { UpdateProjectRequest } from "@/lib/api/types";

export function useProjectsQuery(organizationId: string) {
  return useQuery({
    queryKey: queryKeys.projects(organizationId),
    queryFn: () => getProjects(organizationId),
    enabled: !!organizationId,
  });
}

export function useProjectQuery(organizationId: string, projectSlug: string) {
  return useQuery({
    queryKey: [...queryKeys.projects(organizationId), projectSlug],
    queryFn: () => getProject(organizationId, projectSlug),
    enabled: !!organizationId && !!projectSlug,
  });
}

export function useCreateProjectMutation(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof createProject>[1]) => createProject(organizationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects(organizationId) });
    },
  });
}

export function useUpdateProjectMutation(organizationId: string, projectSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof updateProject>[2]) =>
      updateProject(organizationId, projectSlug, payload),
    onSuccess: (data) => {
      // IMPORTANT: use new slug from response
      const newSlug = data.slug;

      // Update cache with new slug key
      queryClient.setQueryData(
        [...queryKeys.projects(organizationId), newSlug],
        data
      );

      // Remove old cache entry if slug changed
      if (newSlug !== projectSlug) {
        queryClient.removeQueries({ queryKey: [...queryKeys.projects(organizationId), projectSlug] });
      }

      // Invalidate to refetch and ensure consistency
      queryClient.invalidateQueries({ queryKey: [...queryKeys.projects(organizationId), newSlug] });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects(organizationId) });
    },
  });
}

export function useArchiveProjectMutation(organizationId: string, projectSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => archiveProject(organizationId, projectSlug),
    onSuccess: () => {
      // Invalidate projects list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.projects(organizationId) });
    },
  });
}

export function useDeleteProjectMutation(organizationId: string, projectSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (confirmation: UpdateProjectRequest) =>
      deleteProject(organizationId, projectSlug, confirmation),
    onSuccess: () => {
      // Remove specific project cache entries first
      queryClient.removeQueries({ queryKey: [...queryKeys.projects(organizationId), projectSlug] });
      queryClient.removeQueries({ queryKey: [...queryKeys.projects(organizationId), projectSlug, "members"] });
      // Use exact:true so only the list query is invalidated, NOT individual project queries
      // (prefix matching would re-trigger a fetch for the just-deleted project on the still-mounted page)
      queryClient.invalidateQueries({ queryKey: queryKeys.projects(organizationId), exact: true });
    },
  });
}

export function useProjectMembersQuery(organizationId: string, projectSlug: string) {
  return useQuery({
    queryKey: [...queryKeys.projects(organizationId), projectSlug, "members"],
    queryFn: () => getProjectMembers(organizationId, projectSlug),
    enabled: !!organizationId && !!projectSlug,
  });
}

export function useAddProjectMemberMutation(organizationId: string, projectSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof addProjectMember>[2]) =>
      addProjectMember(organizationId, projectSlug, payload),
    onSuccess: (data) => {
      // Update the members list cache
      const queryKey = [...queryKeys.projects(organizationId), projectSlug, "members"];
      const existingMembers = queryClient.getQueryData(queryKey) as any[] | undefined;
      if (existingMembers) {
        queryClient.setQueryData(queryKey, [...existingMembers, data]);
      }
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useRemoveProjectMemberMutation(organizationId: string, projectSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => removeProjectMember(organizationId, projectSlug, userId),
    onSuccess: (_data, userId) => {
      // Remove the member from cache directly
      const queryKey = [...queryKeys.projects(organizationId), projectSlug, "members"];
      const existingMembers = queryClient.getQueryData(queryKey) as any[] | undefined;
      if (existingMembers) {
        const updatedMembers = existingMembers.filter((m: any) => m.user.id !== userId);
        queryClient.setQueryData(queryKey, updatedMembers);
      }
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
