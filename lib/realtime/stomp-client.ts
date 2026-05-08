"use client";

import { Client } from "@stomp/stompjs";

let sharedClient: Client | null = null;
let activeSubscriptions = 0;

async function getWebSocketUrl() {
  const base = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8081/ws";
  try {
    const response = await fetch("/api/ws-token", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      return base;
    }

    const data = (await response.json()) as { accessToken?: string };
    if (!data.accessToken) return base;

    const separator = base.includes("?") ? "&" : "?";
    return `${base}${separator}token=${encodeURIComponent(data.accessToken)}`;
  } catch {
    return base;
  }
}

export function getStompClient() {
  if (sharedClient) return sharedClient;

  const client = new Client({
    brokerURL: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8081/ws",
    reconnectDelay: 3000,
    heartbeatIncoming: 15000,
    heartbeatOutgoing: 15000,
    debug: process.env.NODE_ENV !== "production" ? (msg) => console.info("[STOMP]", msg) : undefined,
    beforeConnect: async () => {
      client.brokerURL = await getWebSocketUrl();
    },
  });

  client.onStompError = (frame) => {
    console.error("[STOMP] Broker error", frame.headers["message"], frame.body);
  };

  sharedClient = client;
  return client;
}

export function retainStompClient() {
  activeSubscriptions += 1;
  return () => {
    activeSubscriptions = Math.max(0, activeSubscriptions - 1);
    if (activeSubscriptions === 0 && sharedClient) {
      sharedClient.deactivate();
    }
  };
}
