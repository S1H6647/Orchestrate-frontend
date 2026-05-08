"use client";

import { useEffect, useCallback } from "react";
import { getStompClient, retainStompClient } from "./stomp-client";
import { NotificationPayload, getNotificationTitle } from "./notification-events";
import { useToast } from "@/components/ui/toast";
import { addNotification as addToStore } from "./notification-store";

type UseNotificationSubscriptionOptions = {
  userId: string | undefined;
  enabled?: boolean;
};

export function useNotificationSubscription({
  userId,
  enabled = true,
}: UseNotificationSubscriptionOptions) {
  if (process.env.NODE_ENV !== "production") {
    console.info("[NOTIF] Hook called with userId:", userId, "enabled:", enabled);
  }
  
  const { push } = useToast();

  const addNotification = useCallback((notification: NotificationPayload) => {
    addToStore(notification);

    push({
      title: getNotificationTitle(notification.type),
      description: notification.content,
      kind: "info",
    });
  }, [push]);

  useEffect(() => {
    if (!enabled || !userId) {
      if (process.env.NODE_ENV !== "production") {
        console.info("[STOMP] No subscription - enabled:", enabled, "userId:", userId);
      }
      return;
    }

    const client = getStompClient();
    const release = retainStompClient();
    let subscription: { unsubscribe: () => void } | null = null;

    client.onStompError = (frame) => {
      console.error("[STOMP] STOMP error:", frame.headers.message, frame.body);
    };

    const previousOnConnect = client.onConnect;

    const subscribe = () => {
      const destinations = [
        `/user/queue/notifications`,
        `/user/${userId}/queue/notifications`,
        `/queue/notifications`,
      ];

      const subs: { unsubscribe: () => void }[] = [];

      destinations.forEach((destination) => {
        if (process.env.NODE_ENV !== "production") {
          console.info("[STOMP] Subscribing to:", destination);
        }
        const sub = client.subscribe(destination, (message) => {
          if (process.env.NODE_ENV !== "production") {
            console.info("[STOMP] Raw message:", message.command, message.headers, message.body);
          }
          if (!message.body) {
            if (process.env.NODE_ENV !== "production") {
              console.info("[STOMP] Empty message body");
            }
            return;
          }

          let payload: NotificationPayload;
          try {
            payload = JSON.parse(message.body) as NotificationPayload;
          } catch (e) {
            console.warn("[STOMP] Parse error:", e, "body:", message.body);
            return;
          }

          if (process.env.NODE_ENV !== "production") {
            console.info("[STOMP] Notification payload:", payload);
          }
          addNotification(payload);
        });
        subs.push(sub);
      });

      subscription = {
        unsubscribe: () => subs.forEach((sub) => sub.unsubscribe()),
      };
    };

    client.onConnect = (frame) => {
      previousOnConnect?.(frame);
      if (process.env.NODE_ENV !== "production") {
        console.info("[STOMP] Connected for notifications", frame?.headers);
      }
      subscribe();
    };

    if (client.connected) {
      if (process.env.NODE_ENV !== "production") {
        console.info("[STOMP] Client already connected, subscribing now");
      }
      subscribe();
    }

    if (!client.active) {
      if (process.env.NODE_ENV !== "production") {
        console.info("[STOMP] Activating client");
      }
      client.activate();
    }

    return () => {
      subscription?.unsubscribe();
      client.onConnect = previousOnConnect;
      release();
    };
  }, [enabled, userId, addNotification]);

  return {
    addNotification,
  };
}
