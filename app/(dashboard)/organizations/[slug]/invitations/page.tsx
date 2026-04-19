"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Mail, Send, RefreshCw, X } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { LoadingState } from "@/components/ui/loading-state";
import { useToast } from "@/components/ui/toast";
import { ApiClientError } from "@/lib/api/error";
import {
  useCancelInvitationMutation,
  useInviteMemberMutation,
  useOrganizationBySlug,
  useOrganizationInvitationsQuery,
  useResendInvitationMutation,
} from "@/lib/query/organization-hooks";
import { inviteSchema } from "@/lib/validation";
import { getOrgPermissions } from "@/lib/permissions/org-permissions";

export default function InvitationsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { push } = useToast();

  const resolveQuery = useOrganizationBySlug(slug);
  const organizationId = resolveQuery.data?.id;
  const myRole = resolveQuery.data?.myRole;
  const perms = getOrgPermissions(myRole);

  const invitationsQuery = useOrganizationInvitationsQuery(organizationId as string);
  const inviteMutation = useInviteMemberMutation(organizationId as string);
  const resendMutation = useResendInvitationMutation(organizationId as string);
  const cancelMutation = useCancelInvitationMutation(organizationId as string);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"OWNER" | "ADMIN" | "MEMBER">("MEMBER");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [cancelInviteId, setCancelInviteId] = useState<string | null>(null);
  const [viewInvitation, setViewInvitation] = useState<{
    email: string;
    role: string;
    status: string;
    expiresAt: string;
    token: string;
  } | null>(null);

  const isLoading = resolveQuery.isLoading || (!!organizationId && invitationsQuery.isLoading);

  if (isLoading) {
    return (
      <div className="page-shell">
        <LoadingState rows={5} />
      </div>
    );
  }

  if (resolveQuery.isError || (!resolveQuery.isLoading && !organizationId)) {
    return (
      <div className="page-shell">
        <Alert tone="error">Could not find organization for invitation.</Alert>
      </div>
    );
  }

  if (!perms.canManageInvitations) {
    return (
      <div className="page-shell">
        <Alert tone="error">You do not have access to invitations.</Alert>
      </div>
    );
  }

  async function onInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    const parsed = inviteSchema.safeParse({ email, role });
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (typeof key === "string") {
          nextErrors[key] = issue.message;
        }
      });
      setFieldErrors(nextErrors);
      return;
    }

    try {
      const result = await inviteMutation.mutateAsync(parsed.data);
      push({ title: result.message, kind: "success" });
      setEmail("");
      setRole("MEMBER");
    } catch (error) {
      if (error instanceof ApiClientError) {
        setGeneralError(error.message);
        setFieldErrors(error.details ?? {});
      } else {
        setGeneralError("Could not send invitation.");
      }
    }
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">Invitations</h1>
          <p className="page-description">Invite teammates and manage pending invitations. This page is intentionally separate from the sidebar.</p>
        </div>
        <Link href={`/organizations/${slug}/settings`}>
          <Button variant="ghost">Back to Settings</Button>
        </Link>
      </div>

      {/* Invite form */}
      <Card>
        <div className="card-header">
          <div>
            <div className="card-title">Invite a Member</div>
            <div className="card-desc">They will receive an email with a link to join this organization.</div>
          </div>
        </div>
        <form onSubmit={onInvite} className="form-grid" noValidate>
          {generalError ? <Alert tone="error">{generalError}</Alert> : null}
          <div className="form-grid two">
            <FormField label="Email address" htmlFor="inviteEmail" error={fieldErrors.email}>
              <Input
                id="inviteEmail"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                error={fieldErrors.email}
                placeholder="colleague@company.com"
              />
            </FormField>
            <FormField label="Role" htmlFor="inviteRole" error={fieldErrors.role}>
              <Select
                id="inviteRole"
                value={role}
                onChange={(event) => setRole(event.target.value as "OWNER" | "ADMIN" | "MEMBER")}
              >
                <option value="OWNER">OWNER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="MEMBER">MEMBER</option>
              </Select>
            </FormField>
          </div>
          <div className="row" style={{ justifyContent: "flex-end" }}>
            <Button type="submit" loading={inviteMutation.isPending} icon={<Send size={14} />}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Card>

      {/* Invitations list */}
      <Card padding="0">
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <div className="card-title">Pending Invitations</div>
        </div>
        {invitationsQuery.isError ? (
          <div style={{ padding: "16px" }}>
            <Alert tone="error">Unable to load invitations.</Alert>
          </div>
        ) : (invitationsQuery.data?.length ?? 0) === 0 ? (
          <div style={{ padding: "32px 20px", textAlign: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                <Mail size={20} />
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: 13.5 }}>No pending invitations.</p>
            </div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Expires</th>
                  <th style={{ width: 220 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invitationsQuery.data?.map((invitation) => (
                  <tr key={invitation.token}>
                    <td className="table-name">{invitation.email}</td>
                    <td>
                      <span className="badge badge-muted">{invitation.role}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          invitation.status === "PENDING"
                            ? "badge-warning"
                            : invitation.status === "ACCEPTED"
                            ? "badge-success"
                            : "badge-muted"
                        }`}
                      >
                        {invitation.status}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: 13 }}>
                      {new Date(invitation.expiresAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="row" style={{ gap: "6px" }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<RefreshCw size={12} />}
                          onClick={async () => {
                            await resendMutation.mutateAsync(invitation.token);
                            push({ title: "Invitation resent", kind: "success" });
                          }}
                        >
                          Resend
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          icon={<X size={12} />}
                          onClick={() => setCancelInviteId(invitation.token)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setViewInvitation(invitation)}
                        >
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!cancelInviteId}
        title="Cancel invitation"
        description="This will invalidate the invitation token immediately. The recipient will not be able to use the link."
        onCancel={() => setCancelInviteId(null)}
        onConfirm={async () => {
          if (!cancelInviteId) return;
          await cancelMutation.mutateAsync(cancelInviteId);
          push({ title: "Invitation cancelled", kind: "success" });
          setCancelInviteId(null);
        }}
        loading={cancelMutation.isPending}
      />
      <ConfirmDialog
        open={!!viewInvitation}
        title="Invitation Details"
        description="Share this link with the recipient if they didn't receive the email."
        onCancel={() => setViewInvitation(null)}
        onConfirm={() => setViewInvitation(null)}
        confirmLabel="Close"
        tone="primary"
      >
        {viewInvitation && (
          <div className="form-grid" style={{ gap: "20px" }}>
            <div className="form-grid two">
              <FormField label="Recipient">
                <Input value={viewInvitation.email} readOnly />
              </FormField>
              <FormField label="Target Role">
                <Input value={viewInvitation.role} readOnly />
              </FormField>
            </div>
            
            <div className="form-grid two">
              <FormField label="Status">
                <Input value={viewInvitation.status} readOnly />
              </FormField>
              <FormField label="Expires">
                <Input value={new Date(viewInvitation.expiresAt).toLocaleDateString()} readOnly />
              </FormField>
            </div>

            <FormField label="Invitation Link (Copy manually if needed)">
              <div className="input-wrapper">
                <Input 
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/invitations/${viewInvitation.token}`} 
                  readOnly 
                />
              </div>
            </FormField>
          </div>
        )}
      </ConfirmDialog>

    </div>
  );
}
