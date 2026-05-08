"use client";

import { useState } from "react";
import { Bell, X } from "lucide-react";
import { getNotificationTitle } from "@/lib/realtime/notification-events";
import { formatDistanceToNow } from "@/lib/utils";
import { useNotificationStore, markNotificationRead } from "@/lib/realtime/notification-store";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount } = useNotificationStore();

  return (
    <div style={{ position: "relative" }}>
      <button
        className="icon-btn"
        aria-label="Notifications"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "relative",
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              background: "var(--destructive)",
              color: "white",
              borderRadius: "50%",
              width: "16px",
              height: "16px",
              fontSize: "10px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 40,
            }}
            onClick={() => setIsOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: "320px",
              maxHeight: "400px",
              overflowY: "auto",
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              zIndex: 50,
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontWeight: 600, fontSize: "14px" }}>
                Notifications
              </span>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  color: "var(--text-muted)",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {notifications.length === 0 ? (
              <div
                style={{
                  padding: "24px 16px",
                  textAlign: "center",
                  color: "var(--text-muted)",
                  fontSize: "13px",
                }}
              >
                No notifications yet
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markNotificationRead(notification.id)}
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--border)",
                      cursor: "pointer",
                      background: notification.isRead
                        ? "transparent"
                        : "var(--accent)",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        notification.isRead
                          ? "transparent"
                          : "var(--accent)";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "4px",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: "13px",
                        }}
                      >
                        {getNotificationTitle(notification.type)}
                      </span>
                      {!notification.isRead && (
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "var(--primary)",
                            flexShrink: 0,
                            marginLeft: "8px",
                          }}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "var(--text)",
                        lineHeight: 1.4,
                      }}
                    >
                      {notification.content}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--text-muted)",
                        marginTop: "4px",
                      }}
                    >
                      {formatDistanceToNow(notification.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
