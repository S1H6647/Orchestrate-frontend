"use client";

import Link from "next/link";
import { Mail, Check, X } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { useToast } from "@/components/ui/toast";
import { ApiClientError } from "@/lib/api/error";
import {
  useAcceptInvitationMutation,
  useDeclineInvitationMutation,
  useMyInvitationsQuery,
} from "@/lib/query/organization-hooks";

export default function MyInvitationsPage() {
  const { push } = useToast();
  const invitationsQuery = useMyInvitationsQuery();
  const acceptMutation = useAcceptInvitationMutation();
  const declineMutation = useDeclineInvitationMutation();

  if (invitationsQuery.isLoading) {
    return (
      <div className="page-shell">
        <LoadingState rows={5} />
      </div>
    );
  }

  if (invitationsQuery.isError) {
    return (
      <div className="page-shell">
        <Alert tone="error">Unable to load your invitations.</Alert>
      </div>
    );
  }

  const invitations = invitationsQuery.data ?? [];

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Invitations</h1>
          <p className="page-description">Review and respond to organization invites sent to your account.</p>
        </div>
      </div>

      {invitations.length === 0 ? (
        <Card>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "8px 0" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
              <Mail size={20} />
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: 13.5 }}>No pending invitations.</p>
          </div>
        </Card>
      ) : (
        <Card padding="0">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Role</th>
                  <th>Expires</th>
                  <th style={{ width: 240 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((invitation) => (
                  <tr key={invitation.token}>
                    <td>
                      <div className="table-name">{invitation.organizationName}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>/ {invitation.organizationSlug}</div>
                    </td>
                    <td>
                      <span className="badge badge-muted">{invitation.role}</span>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: 13 }}>
                      {new Date(invitation.expiresAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="row" style={{ gap: "8px" }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Check size={12} />}
                          loading={acceptMutation.isPending}
                          onClick={async () => {
                            try {
                              await acceptMutation.mutateAsync(invitation.token);
                              push({ title: "Invitation accepted", kind: "success" });
                              invitationsQuery.refetch();
                            } catch (error) {
                              if (error instanceof ApiClientError) {
                                push({ title: error.message, kind: "error" });
                              } else {
                                push({ title: "Unable to accept invitation.", kind: "error" });
                              }
                            }
                          }}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          icon={<X size={12} />}
                          loading={declineMutation.isPending}
                          onClick={async () => {
                            try {
                              await declineMutation.mutateAsync(invitation.token);
                              push({ title: "Invitation declined", kind: "info" });
                              invitationsQuery.refetch();
                            } catch (error) {
                              if (error instanceof ApiClientError) {
                                push({ title: error.message, kind: "error" });
                              } else {
                                push({ title: "Unable to decline invitation.", kind: "error" });
                              }
                            }
                          }}
                        >
                          Decline
                        </Button>
                        <Link href={`/invitations/${invitation.token}`}>
                          <Button variant="secondary" size="sm">Open</Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
