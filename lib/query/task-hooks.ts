"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  reorderTask,
  deleteTask,
  createSubTask,
  updateSubTask,
  deleteSubTask,
  addTaskLabel,
  removeTaskLabel,
  getComments,
  createComment,
  updateComment,
} from "@/lib/api/tasks";
import { queryKeys } from "@/lib/query/keys";
import {
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateSubTaskRequest,
  UpdateSubTaskRequest,
  TaskStatus,
  CreateCommentRequest,
  UpdateCommentRequest,
} from "@/lib/api/types";

export function useTasksQuery(organizationId: string, projectSlug: string, filters?: { status?: TaskStatus; assigneeId?: string }) {
  return useQuery({
    queryKey: [...queryKeys.tasks(organizationId, projectSlug), filters],
    queryFn: () => getTasks(organizationId, projectSlug, filters),
    enabled: !!organizationId && !!projectSlug,
  });
}

export function useCreateTaskMutation(organizationId: string, projectSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTaskRequest) => createTask(organizationId, projectSlug, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks(organizationId, projectSlug) });
    },
  });
}

export function useUpdateTaskMutation(organizationId: string, projectSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: UpdateTaskRequest }) =>
      updateTask(organizationId, projectSlug, taskId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks(organizationId, projectSlug) });
    },
  });
}

export function useReorderTaskMutation(organizationId: string, projectSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: { status: TaskStatus; position: number } }) =>
      reorderTask(organizationId, projectSlug, taskId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks(organizationId, projectSlug) });
    },
  });
}

export function useDeleteTaskMutation(organizationId: string, projectSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => deleteTask(organizationId, projectSlug, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks(organizationId, projectSlug) });
    },
  });
}

export function useCreateSubTaskMutation(organizationId: string, projectSlug: string, taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSubTaskRequest) => createSubTask(organizationId, projectSlug, taskId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks(organizationId, projectSlug) });
    },
  });
}

export function useUpdateSubTaskMutation(organizationId: string, projectSlug: string, taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subTaskId, payload }: { subTaskId: string; payload: UpdateSubTaskRequest }) =>
      updateSubTask(organizationId, projectSlug, taskId, subTaskId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks(organizationId, projectSlug) });
    },
  });
}

export function useDeleteSubTaskMutation(organizationId: string, projectSlug: string, taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subTaskId: string) => deleteSubTask(organizationId, projectSlug, taskId, subTaskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks(organizationId, projectSlug) });
    },
  });
}

export function useAddTaskLabelMutation(organizationId: string, projectSlug: string, taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (labelName: string) => addTaskLabel(organizationId, projectSlug, taskId, labelName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks(organizationId, projectSlug) });
    },
  });
}

export function useRemoveTaskLabelMutation(organizationId: string, projectSlug: string, taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (labelId: string) => removeTaskLabel(organizationId, projectSlug, taskId, labelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks(organizationId, projectSlug) });
    },
  });
}

export function useTaskCommentsQuery(organizationId: string, projectSlug: string, taskId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.comments(organizationId, projectSlug, taskId),
    queryFn: () => getComments(organizationId, projectSlug, taskId),
    enabled: !!organizationId && !!projectSlug && !!taskId && enabled,
  });
}

export function useCreateCommentMutation(organizationId: string, projectSlug: string, taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCommentRequest) => createComment(organizationId, projectSlug, taskId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments(organizationId, projectSlug, taskId) });
    },
  });
}

export function useUpdateCommentMutation(organizationId: string, projectSlug: string, taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, payload }: { commentId: string; payload: UpdateCommentRequest }) =>
      updateComment(organizationId, projectSlug, taskId, commentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments(organizationId, projectSlug, taskId) });
    },
  });
}
