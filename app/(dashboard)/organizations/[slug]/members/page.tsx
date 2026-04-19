"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Select } from "@/components/ui/select";
import { LoadingState } from "@/components/ui/loading-state";
import { useToast } from "@/components/ui/toast";
import { canManageMembers, isStrictlyHigherRole } from "@/lib/auth/roles";
import { OrganizationRole } from "@/lib/api/types";
import { useMeQuery } from "@/lib/query/auth-hooks";
import {
  useOrganizationBySlug,
  useOrganizationMembersQuery,
  useRemoveMemberMutation,
  useRestoreMemberMutation,
  useUpdateRoleMutation,
} from "@/lib/query/organization-hooks";

const roles: OrganizationRole[] = ["ADMIN", "MEMBER", "VIEWER"];

function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function RoleBadge({ role }: { role: OrganizationRole }) {
  const map: Record<OrganizationRole, string> = {
    OWNER: "badge-danger",
    ADMIN: "badge-warning",
    MEMBER: "badge-primary",
    VIEWER: "badge-muted",
  };
  return <span className={`badge ${map[role] ?? "badge-muted"}`}>{role}</span>;
}

export default function MembersPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { push } = useToast();

  const resolveQuery = useOrganizationBySlug(slug);
  const organizationId = resolveQuery.data?.id;

  const meQuery = useMeQuery();
  const membersQuery = useOrganizationMembersQuery(organizationId as string);
  const updateRoleMutation = useUpdateRoleMutation(organizationId as string);
  const removeMutation = useRemoveMemberMutation(organizationId as string);
  const restoreMutation = useRestoreMemberMutation(organizationId as string);

  const [pendingRemoveUser, setPendingRemoveUser] = useState<string | null>(null);

  const myMembership = useMemo(() => {
    const meEmail = meQuery.data?.email;
    if (!meEmail || !membersQuery.data) return null;
    return membersQuery.data.find((member) => member.user.email === meEmail) ?? null;
  }, [membersQuery.data, meQuery.data?.email]);

  const myRole = myMembership?.role;
  const canManage = canManageMembers(myRole);

  const isLoading = resolveQuery.isLoading || (!!organizationId && membersQuery.isLoading);

  if (isLoading) {
    return (
      <div className="page-shell">
        <LoadingState rows={6} />
      </div>
    );
  }

  if (membersQuery.isError || !membersQuery.data) {
    return (
      <div className="page-shell">
        <Alert tone="error">Unable to load organization members.</Alert>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">Members</h1>
          <p className="page-description">
            {membersQuery.data.length} member{membersQuery.data.length !== 1 ? "s" : ""} &middot; manage roles and access
          </p>
        </div>
        {!canManage && (
          <Alert tone="info">You don&apos;t have permission to change member roles.</Alert>
        )}
      </div>

      <Card padding="0">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Status</th>
                <th>Role</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {membersQuery.data.map((member) => {
                const canMutate =
                  !!myRole &&
                  member.user.email !== meQuery.data?.email &&
                  isStrictlyHigherRole(myRole, member.role);
                const isMe = member.user.email === meQuery.data?.email;

                return (
                  <tr key={member.user.id}>
                    <td>
                      <div className="row" style={{ gap: "10px" }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: isMe
                              ? "linear-gradient(135deg, var(--primary), #7c8df9)"
                              : "linear-gradient(135deg, #667eea, #764ba2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#fff",
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(member.user.name)}
                        </div>
                        <div>
                          <div className="table-name">
                            {member.user.name}
                            {isMe && (
                              <span
                                style={{
                                  marginLeft: 6,
                                  fontSize: 10,
                                  fontWeight: 600,
                                  background: "var(--primary-soft)",
                                  color: "var(--primary)",
                                  borderRadius: 4,
                                  padding: "1px 5px",
                                }}
                              >
                                You
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{member.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${member.status === "ACTIVE" ? "badge-success" : "badge-muted"}`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td>
                      {canManage && canMutate ? (
                        <Select
                          value={member.role}
                          disabled={updateRoleMutation.isPending}
                          onChange={async (event) => {
                            const role = event.target.value as OrganizationRole;
                            await updateRoleMutation.mutateAsync({ userId: member.user.id, role });
                            push({ title: "Role updated", kind: "success" });
                          }}
                          style={{ width: 120, height: 30, fontSize: 13 }}
                        >
                          {roles.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <RoleBadge role={member.role} />
                      )}
                    </td>
                    <td>
                      {member.status !== "REMOVED" ? (
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={!canManage || !canMutate}
                          onClick={() => setPendingRemoveUser(member.user.id)}
                        >
                          Remove
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={!canManage || !canMutate}
                          onClick={async () => {
                            await restoreMutation.mutateAsync(member.user.id);
                            push({ title: "Member restored", kind: "success" });
                          }}
                        >
                          Restore
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmDialog
        open={!!pendingRemoveUser}
        title="Remove member"
        description="The member will be soft-removed and can be restored at any time."
        loading={removeMutation.isPending}
        onCancel={() => setPendingRemoveUser(null)}
        onConfirm={async () => {
          if (!pendingRemoveUser) return;
          await removeMutation.mutateAsync(pendingRemoveUser);
          push({ title: "Member removed", kind: "success" });
          setPendingRemoveUser(null);
        }}
      />
    </div>
  );
}
