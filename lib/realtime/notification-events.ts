export type NotificationType =
  | "TASK_CREATED"
  | "TASK_MOVED"
  | "TASK_DELETED"
  | "TASK_ASSIGNED"
  | "TASK_UPDATED"
  | "LABEL_ADDED"
  | "LABEL_REMOVED";

export type NotificationPayload = {
  id: string;
  recipientId: string;
  type: NotificationType;
  content: string;
  isRead: boolean;
  createdAt: string;
};

export function getNotificationTitle(type: NotificationType): string {
  switch (type) {
    case "TASK_CREATED":
      return "New Task";
    case "TASK_MOVED":
      return "Task Moved";
    case "TASK_DELETED":
      return "Task Deleted";
    case "TASK_ASSIGNED":
      return "Task Assigned";
    case "TASK_UPDATED":
      return "Task Updated";
    case "LABEL_ADDED":
      return "Label Added";
    case "LABEL_REMOVED":
      return "Label Removed";
    default:
      return "Notification";
  }
}