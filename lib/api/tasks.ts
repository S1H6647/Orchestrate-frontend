import { apiRequest } from "@/lib/api/http";
import {
  TaskResponse,
  TaskStatus,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateSubTaskRequest,
  UpdateSubTaskRequest,
  SubTask,
  CommentResponse,
  CreateCommentRequest,
  UpdateCommentRequest,
} from "@/lib/api/types";

export function getTasks(organizationId: string, projectSlug: string, filters?: { status?: TaskStatus; assigneeId?: string }) {
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.assigneeId) params.append("assigneeId", filters.assigneeId);
  
  const query = params.toString();
  return apiRequest<TaskResponse[]>(`/organizations/${organizationId}/projects/${projectSlug}/tasks${query ? `?${query}` : ""}`, {
    auth: true,
  });
}

export function getTask(organizationId: string, projectSlug: string, taskId: string) {
  return apiRequest<TaskResponse>(`/organizations/${organizationId}/projects/${projectSlug}/tasks/${taskId}`, {
    auth: true,
  });
}

export function createTask(organizationId: string, projectSlug: string, input: CreateTaskRequest) {
  return apiRequest<TaskResponse>(`/organizations/${organizationId}/projects/${projectSlug}/tasks`, {
    method: "POST",
    body: input,
    auth: true,
  });
}

export function updateTask(organizationId: string, projectSlug: string, taskId: string, input: UpdateTaskRequest) {
  return apiRequest<TaskResponse>(`/organizations/${organizationId}/projects/${projectSlug}/tasks/${taskId}`, {
    method: "PATCH",
    body: input,
    auth: true,
  });
}

export function reorderTask(organizationId: string, projectSlug: string, taskId: string, input: { status: TaskStatus; position: number }) {
  return apiRequest<TaskResponse>(`/organizations/${organizationId}/projects/${projectSlug}/tasks/${taskId}/reorder`, {
    method: "PATCH",
    body: input,
    auth: true,
  });
}

export function deleteTask(organizationId: string, projectSlug: string, taskId: string) {
  return apiRequest<void>(`/organizations/${organizationId}/projects/${projectSlug}/tasks/${taskId}`, {
    method: "DELETE",
    auth: true,
  });
}

// Sub-tasks
export function getSubTasks(organizationId: string, projectSlug: string, taskId: string) {
  return apiRequest<TaskResponse[]>(`/organizations/${organizationId}/projects/${projectSlug}/tasks/${taskId}/subtasks`, {
    auth: true,
  });
}

export function createSubTask(organizationId: string, projectSlug: string, taskId: string, input: CreateSubTaskRequest) {
  return apiRequest<SubTask>(`/organizations/${organizationId}/projects/${projectSlug}/tasks/${taskId}/subtasks`, {
    method: "POST",
    body: input,
    auth: true,
  });
}

export function updateSubTask(organizationId: string, projectSlug: string, taskId: string, subTaskId: string, input: UpdateSubTaskRequest) {
  return apiRequest<SubTask>(`/organizations/${organizationId}/projects/${projectSlug}/tasks/${taskId}/subtasks/${subTaskId}`, {
    method: "PATCH",
    body: input,
    auth: true,
  });
}

export function deleteSubTask(organizationId: string, projectSlug: string, taskId: string, subTaskId: string) {
  return apiRequest<void>(`/organizations/${organizationId}/projects/${projectSlug}/tasks/${taskId}/subtasks/${subTaskId}`, {
    method: "DELETE",
    auth: true,
  });
}

// Labels
export function addTaskLabel(organizationId: string, projectSlug: string, taskId: string, labelName: string) {
  return apiRequest<TaskResponse>(`/organizations/${organizationId}/projects/${projectSlug}/tasks/${taskId}/labels`, {
    method: "PATCH",
    body: { name: labelName },
    auth: true,
  });
}

export function removeTaskLabel(organizationId: string, projectSlug: string, taskId: string, labelId: string) {
  return apiRequest<void>(`/organizations/${organizationId}/projects/${projectSlug}/tasks/${taskId}/labels/${labelId}`, {
    method: "DELETE",
    auth: true,
  });
}

// Comments
export function getComments(organizationId: string, projectSlug: string, taskId: string) {
  return apiRequest<CommentResponse[]>(`/organizations/${organizationId}/projects/${projectSlug}/tasks/${taskId}/comments`, {
    auth: true,
  });
}

export function createComment(organizationId: string, projectSlug: string, taskId: string, input: CreateCommentRequest) {
  return apiRequest<CommentResponse>(`/organizations/${organizationId}/projects/${projectSlug}/tasks/${taskId}/comments`, {
    method: "POST",
    body: input,
    auth: true,
  });
}

export function updateComment(
  organizationId: string,
  projectSlug: string,
  taskId: string,
  commentId: string,
  input: UpdateCommentRequest
) {
  return apiRequest<CommentResponse>(`/organizations/${organizationId}/projects/${projectSlug}/tasks/${taskId}/comments/${commentId}`, {
    method: "PATCH",
    body: input,
    auth: true,
  });
}
