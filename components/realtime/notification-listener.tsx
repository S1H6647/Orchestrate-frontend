"use client";

import { useMeQuery } from "@/lib/query/auth-hooks";
import { useNotificationSubscription } from "@/lib/realtime/notification-subscription";
import { getSessionSnapshot, subscribeSession } from "@/lib/session/client-session";
import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

export function NotificationListener() {
  const pathname = usePathname();
  const shouldFetchMe = pathname !== "/login" && pathname !== "/logout";
  const meQuery = useMeQuery(shouldFetchMe);
  const session = useSyncExternalStore(subscribeSession, getSessionSnapshot, getSessionSnapshot);
  const userId = meQuery.data?.id ?? session.user?.id;

  console.info("[NOTIF] listener userId:", userId, "status:", meQuery.status);

  useNotificationSubscription({
    userId,
    enabled: !!userId,
  });

  return null;
}
