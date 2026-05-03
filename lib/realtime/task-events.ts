"use client";

import { TaskStatus, TaskResponse } from "@/lib/api/types";

export type TaskMoveEvent = {
  eventType: "task.moved";
  taskId: string;
  projectId: string;
  fromStatus: TaskStatus;
  toStatus: TaskStatus;
  position: number;
  userId: string;
  name: string;
  timestamp: string;
};

export type TaskCreatedEvent = {
  eventType: "task.created";
  projectId: string;
  task: TaskResponse;
  userId: string;
  name: string;
  timestamp: string;
};

export type TaskRealtimeEvent = TaskMoveEvent | TaskCreatedEvent;

export function isTaskMoveEvent(payload: unknown): payload is TaskMoveEvent {
  if (!payload || typeof payload !== "object") return false;
  return (payload as TaskMoveEvent).eventType === "task.moved";
}

export function isTaskCreatedEvent(payload: unknown): payload is TaskCreatedEvent {
  if (!payload || typeof payload !== "object") return false;
  return (payload as TaskCreatedEvent).eventType === "task.created";
}
