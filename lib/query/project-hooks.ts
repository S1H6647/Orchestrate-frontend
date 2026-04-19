"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProject, listProjects } from "@/lib/api/projects";
import { queryKeys } from "@/lib/query/keys";

export function useProjectsQuery(organizationId: string) {
  return useQuery({
    queryKey: queryKeys.projects(organizationId),
    queryFn: () => listProjects(organizationId),
    enabled: !!organizationId,
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
