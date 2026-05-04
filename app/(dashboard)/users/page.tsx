"use client";

import { useMemo, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Pagination } from "@/components/ui/pagination";
import { useMeQuery } from "@/lib/query/auth-hooks";
import { useUserQuery } from "@/lib/query/user-hooks";
import { useUsersQuery } from "@/hooks/queries/useUsersQuery";
import { toDateLabel } from "@/lib/utils";
import { Search } from "lucide-react";

export default function UsersPage() {
  const meQuery = useMeQuery();
  const isSystemAdmin = meQuery.data?.systemRole === "SYSTEM_ADMIN";
  const [search, setSearch] = useState("");
  const [queryParams, setQueryParams] = useState({ page: 0, size: 20, sortBy: "createdAt,DESC", q: "" });
  const usersQuery = useUsersQuery(queryParams, isSystemAdmin);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const userDetailQuery = useUserQuery(selectedUserId ?? undefined, !!selectedUserId && isSystemAdmin);

  const users = usersQuery.data?.content ?? [];
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) =>
      `${user.name} ${user.email} ${user.status ?? ""} ${user.systemRole ?? ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [users, search]);

  if (meQuery.isLoading || usersQuery.isLoading) {
    return (
      <div className="page-shell">
        <LoadingState rows={6} />
      </div>
    );
  }

  if (!isSystemAdmin) {
    return (
      <div className="page-shell">
        <Alert tone="error">You do not have access to view all users.</Alert>
      </div>
    );
  }

  if (usersQuery.isError) {
    return (
      <div className="page-shell">
        <Alert tone="error">Could not load users.</Alert>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-description">All users across the system.</p>
        </div>
        <div style={{ position: "relative", minWidth: 240 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <Input
            value={search}
            onChange={(event) => {
              const value = event.target.value;
              setSearch(value);
              setQueryParams((prev) => ({ ...prev, page: 0, q: value.trim() || "" }));
            }}
            placeholder="Search users"
            style={{ paddingLeft: 34 }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={search ? "No matches" : "No users found"}
          description={search ? "Try a different search term." : "There are no users registered yet."}
        />
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {filtered.map((user) => (
            <button
              key={user.id}
              type="button"
              className="card"
              style={{ padding: "20px 24px", textAlign: "left" }}
              onClick={() => setSelectedUserId(user.id)}
            >
              <div className="row" style={{ justifyContent: "space-between", gap: "16px" }}>
                <div className="stack" style={{ gap: "4px" }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{user.name}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{user.email}</div>
                </div>
                <div className="row" style={{ gap: "10px", alignItems: "center" }}>
                  <span className={`badge ${user.status === "ACTIVE" ? "badge-success" : "badge-muted"}`}>
                    {user.status ?? "UNKNOWN"}
                  </span>
                  <span className="badge badge-muted">{user.systemRole ?? "USER"}</span>
                  <span className={`badge ${user.emailVerified ? "badge-success" : "badge-muted"}`}>
                    {user.emailVerified ? "Verified" : "Unverified"}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {usersQuery.data ? (
        <Pagination
          currentPage={usersQuery.data.number}
          totalPages={usersQuery.data.totalPages}
          pageSize={usersQuery.data.size}
          totalElements={usersQuery.data.totalElements}
          onPageChange={(page) => setQueryParams((prev) => ({ ...prev, page }))}
          onPageSizeChange={(size) => setQueryParams((prev) => ({ ...prev, size, page: 0 }))}
        />
      ) : null}

      <ConfirmDialog
        open={!!selectedUserId}
        title={userDetailQuery.data?.name ?? "User details"}
        description={userDetailQuery.isLoading ? "Loading user details..." : "Full user information"}
        confirmLabel="Close"
        cancelLabel="Cancel"
        onCancel={() => setSelectedUserId(null)}
        onConfirm={() => setSelectedUserId(null)}
        tone="primary"
      >
        {userDetailQuery.isError ? (
          <Alert tone="error">Could not load user details.</Alert>
        ) : userDetailQuery.isLoading || !userDetailQuery.data ? (
          <LoadingState rows={4} />
        ) : (
          <div className="stack" style={{ gap: "16px" }}>
            <div className="row" style={{ gap: "14px", alignItems: "center" }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: "var(--primary-soft)",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 18,
                  overflow: "hidden",
                }}
              >
                {userDetailQuery.data.avatarUrl ? (
                  <img
                    src={userDetailQuery.data.avatarUrl}
                    alt={userDetailQuery.data.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  (userDetailQuery.data.name ?? "U").slice(0, 1).toUpperCase()
                )}
              </div>
              <div className="stack" style={{ gap: "4px" }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{userDetailQuery.data.name}</div>
                <div style={{ color: "var(--text-muted)" }}>{userDetailQuery.data.email}</div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "10px",
              }}
            >
              <div className="card" style={{ padding: "12px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Role
                </div>
                <div style={{ fontWeight: 600 }}>{userDetailQuery.data.systemRole ?? "USER"}</div>
              </div>
              <div className="card" style={{ padding: "12px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Status
                </div>
                <div style={{ fontWeight: 600 }}>{userDetailQuery.data.status ?? "UNKNOWN"}</div>
              </div>
              <div className="card" style={{ padding: "12px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Email Verified
                </div>
                <div style={{ fontWeight: 600 }}>{userDetailQuery.data.emailVerified ? "Yes" : "No"}</div>
              </div>
              <div className="card" style={{ padding: "12px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Auth Provider
                </div>
                <div style={{ fontWeight: 600 }}>{userDetailQuery.data.authProvider ?? "—"}</div>
              </div>
            </div>

            <div className="form-grid two">
              <div className="stack" style={{ gap: "2px" }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Phone</span>
                <span>{userDetailQuery.data.phone ?? "—"}</span>
              </div>
              <div className="stack" style={{ gap: "2px" }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Last login</span>
                <span>{userDetailQuery.data.lastLoginAt ? toDateLabel(userDetailQuery.data.lastLoginAt) : "—"}</span>
              </div>
              <div className="stack" style={{ gap: "2px" }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Created</span>
                <span>{userDetailQuery.data.createdAt ? toDateLabel(userDetailQuery.data.createdAt) : "—"}</span>
              </div>
              <div className="stack" style={{ gap: "2px" }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Updated</span>
                <span>{userDetailQuery.data.updatedAt ? toDateLabel(userDetailQuery.data.updatedAt) : "—"}</span>
              </div>
            </div>
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
