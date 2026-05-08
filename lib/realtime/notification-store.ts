"use client";

import { useSyncExternalStore } from "react";
import type { NotificationPayload } from "./notification-events";

type NotificationState = {
  notifications: NotificationPayload[];
  unreadCount: number;
};

let state: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function subscribeNotifications(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getNotificationState() {
  return state;
}

export function addNotification(notification: NotificationPayload) {
  if (state.notifications.some((item) => item.id === notification.id)) {
    return;
  }

  state = {
    notifications: [notification, ...state.notifications],
    unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1,
  };
  emitChange();
}

export function markNotificationRead(notificationId: string) {
  let changed = false;

  const notifications = state.notifications.map((item) => {
    if (item.id !== notificationId || item.isRead) return item;
    changed = true;
    return { ...item, isRead: true };
  });

  if (!changed) return;

  state = {
    notifications,
    unreadCount: Math.max(0, state.unreadCount - 1),
  };
  emitChange();
}

export function clearNotifications() {
  state = {
    notifications: [],
    unreadCount: 0,
  };
  emitChange();
}

export function useNotificationStore() {
  return useSyncExternalStore(subscribeNotifications, getNotificationState, getNotificationState);
}
