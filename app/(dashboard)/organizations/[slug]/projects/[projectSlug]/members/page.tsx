"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Users, Plus, Search, UserMinus, ShieldAlert, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { useProjectMembersQuery, useAddProjectMemberMutation, useRemoveProjectMemberMutation, useProjectQuery } from "@/lib/query/project-hooks";
import { useOrganizationBySlug, useOrganizationMembersQuery } from "@/lib/query/organization-hooks";
import { useMeQuery } from "@/lib/query/auth-hooks";
import { ProjectRole, ProjectMember } from "@/lib/api/types";
import { toDateLabel } from "@/lib/utils";
import { Select } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { ApiClientError } from "@/lib/api/error";

export default function ProjectMembersPage() {
  const params = useParams<{ slug: string; projectSlug: string }>();
  const { slug, projectSlug } = params;
  const { push } = useToast();

  const meQuery = useMeQuery();
  const orgResolve = useOrganizationBySlug(slug);
  const organizationId = orgResolve.data?.id;

  const projectQuery = useProjectQuery(organizationId as string, projectSlug);
  const project = projectQuery.data;

  const membersQuery = useProjectMembersQuery(organizationId as string, projectSlug);
  const orgMembersQuery = useOrganizationMembersQuery(organizationId as string, { size: 100 });
  
  const addMemberMutation = useAddProjectMemberMutation(organizationId as string, projectSlug);
  const removeMemberMutation = useRemoveProjectMemberMutation(organizationId as string, projectSlug);

  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ id: string, name: string } | null>(null);
  
  const [inviteUserId, setInviteUserId] = useState("");
  const [inviteRole, setInviteRole] = useState<ProjectRole>("CONTRIBUTOR");

  const myProjectRole = project?.myRole;
  const canManageMembers = myProjectRole === "MANAGER" || orgResolve.data?.myRole === "OWNER" || orgResolve.data?.myRole === "ADMIN";

  const isLoading = orgResolve.isLoading || projectQuery.isLoading || membersQuery.isLoading;

  const handleAddMember = async () => {
    if (!inviteUserId) return;
    try {
      await addMemberMutation.mutateAsync({ userId: inviteUserId, role: inviteRole });
      push({ title: "Member added successfully", kind: "success" });
      setShowAddDialog(false);
      setInviteUserId("");
    } catch (err) {
      push({ 
        title: "Failed to add member", 
        description: err instanceof ApiClientError ? err.message : "Please try again.",
        kind: "error" 
      });
    }
  };

  // Filter organization members to show only those NOT already in the project
  const projectMemberIds = new Set((membersQuery.data ?? []).map(m => m.user.id));
  const availableOrgMembers = (orgMembersQuery.data?.content ?? []).filter(
    m => !projectMemberIds.has(m.user.id) && m.status === "ACTIVE"
  );

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      await removeMemberMutation.mutateAsync(memberToRemove.id);
      push({ title: "Member removed successfully", kind: "success" });
      setShowRemoveDialog(false);
      setMemberToRemove(null);
    } catch (err) {
      push({ 
        title: "Failed to remove member", 
        description: err instanceof ApiClientError ? err.message : "Please check your permissions and try again.",
        kind: "error" 
      });
    }
  };

  if (isLoading) {
    return (
      <div className="page-shell">
        <LoadingState rows={6} />
      </div>
    );
  }

  const members = membersQuery.data ?? [];
  const filteredMembers = members.filter(m => 
    m.user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isEmpty = filteredMembers.length === 0;

  return (
    <div className="page-shell">
      <div className="page-header animate-in fade-in duration-500">
        <div>
          <h1 className="page-title">Project Team</h1>
          <p className="page-description">
            Manage access and roles for <strong>{project?.name}</strong>.
          </p>
        </div>
        {canManageMembers && (
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => setShowAddDialog(true)}>
            Add Member
          </Button>
        )}
      </div>

      {/* Add Member Dialog */}
      <ConfirmDialog
        open={showAddDialog}
        title="Add Team Member"
        description={`Choose an organization member to join ${project?.name}.`}
        confirmLabel="Add to Project"
        cancelLabel="Cancel"
        tone="primary"
        onConfirm={handleAddMember}
        onCancel={() => setShowAddDialog(false)}
        loading={addMemberMutation.isPending}
        confirmDisabled={!inviteUserId}
      >
        <div className="stack" style={{ gap: "20px" }}>
          <div className="stack" style={{ gap: "6px" }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Select Member</label>
            <Select
              value={inviteUserId}
              onChange={(e) => setInviteUserId(e.target.value)}
              required
            >
              <option value="" disabled>Choose an organization member...</option>
              {availableOrgMembers.map(m => (
                <option key={m.user.id} value={m.user.id}>
                  {m.user.name} ({m.user.email})
                </option>
              ))}
              {availableOrgMembers.length === 0 && !orgMembersQuery.isLoading && (
                <option disabled>No other active members in organization</option>
              )}
            </Select>
          </div>
          <div className="stack" style={{ gap: "6px" }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Role</label>
            <Select 
              value={inviteRole} 
              onChange={(e) => setInviteRole(e.target.value as ProjectRole)}
            >
              <option value="MANAGER">Project Manager</option>
              <option value="CONTRIBUTOR">Contributor</option>
              <option value="VIEWER">Viewer</option>
            </Select>
          </div>
        </div>
      </ConfirmDialog>

      {/* Remove Member Dialog */}
      <ConfirmDialog
        open={showRemoveDialog}
        title="Remove Member"
        description={`Are you sure you want to remove ${memberToRemove?.name} from this project? They will lose all access to project resources.`}
        confirmLabel="Remove Member"
        tone="danger"
        onConfirm={handleRemoveMember}
        onCancel={() => setShowRemoveDialog(false)}
        loading={removeMemberMutation.isPending}
      />

      <Card padding="0">
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="row" style={{ gap: "12px", flex: 1, maxWidth: "400px" }}>
            <Search size={18} style={{ color: "var(--text-muted)" }} />
            <Input 
              placeholder="Search members..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: "none", padding: 0 }}
            />
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {filteredMembers.length} members
          </div>
        </div>

        {isEmpty ? (
          <div style={{ padding: "40px" }}>
            <EmptyState 
              title="No members found" 
              description={searchQuery ? "Try a different search term." : "No one is assigned to this project yet."}
              icon={<Users size={32} />}
            />
          </div>
        ) : (
          <>
            <style>{`
              @media (min-width: 768px) {
                .mobile-cards { display: none !important; }
                .desktop-table-wrapper { display: block !important; }
              }
              @media (max-width: 767px) {
                .mobile-cards { display: flex !important; }
                .desktop-table-wrapper { display: none !important; }
              }
            `}</style>

            {/* Desktop Table View */}
            <div className="table-wrapper desktop-table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Member Identity</th>
                    <th>Project Role</th>
                    <th>Joined Date</th>
                    {canManageMembers && <th style={{ textAlign: 'right' }}>Operations</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <MemberRow 
                      key={member.id} 
                      member={member}
                      myId={meQuery.data?.id}
                      canManage={canManageMembers}
                      onRemove={(id, name) => {
                        setMemberToRemove({ id, name });
                        setShowRemoveDialog(true);
                      }}
                      isUpdating={removeMemberMutation.isPending}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards View */}
            <div className="stack mobile-cards" style={{ gap: 16, display: 'none', flexDirection: 'column', padding: '20px' }}>
              {filteredMembers.map((member) => (
                <MemberMobileCard 
                  key={member.id} 
                  member={member}
                  myId={meQuery.data?.id}
                  canManage={canManageMembers}
                  onRemove={(id, name) => {
                    setMemberToRemove({ id, name });
                    setShowRemoveDialog(true);
                  }}
                  isUpdating={removeMemberMutation.isPending}
                />
              ))}
            </div>
          </>
        )}
      </Card>
      
      {!canManageMembers && (
        <div style={{ display: "flex", gap: "8px", alignItems: "center", color: "var(--text-muted)", fontSize: 13, justifyContent: "center", marginTop: "24px" }}>
          <ShieldAlert size={14} />
          <span>Only project managers can modify the project team.</span>
        </div>
      )}
    </div>
  );
}

function getGradientForUser(name: string) {
  const colors = [
    { from: "#667eea", to: "#764ba2" },
    { from: "#fbc2eb", to: "#a6c1ee" },
    { from: "#4facfe", to: "#00f2fe" },
    { from: "#43e97b", to: "#38f9d7" },
    { from: "#fa709a", to: "#fee140" },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function MemberAvatar({ name, isMe }: { name: string; isMe?: boolean }) {
  const gradient = getGradientForUser(name);
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  return (
    <div 
      className="member-avatar-wrapper"
      style={{ background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})` }}
    >
      <span>{initials}</span>
      {isMe && (
        <div className="member-you-badge">
          <CheckCircle2 size={10} strokeWidth={3} />
        </div>
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: ProjectRole }) {
  const badgeClass = role === "MANAGER" ? "badge badge-primary" : "badge badge-muted";
  return (
    <span className={badgeClass}>
      {role}
    </span>
  );
}

function MemberRow({ 
  member, 
  myId, 
  canManage,
  onRemove,
  isUpdating,
}: { 
  member: ProjectMember;
  myId?: string;
  canManage: boolean;
  onRemove: (id: string, name: string) => void;
  isUpdating: boolean;
}) {
  const isMe = member.user.id === myId;
  
  return (
    <tr>
      <td>
        <div className="row" style={{ gap: 16 }}>
          <MemberAvatar name={member.user.name} isMe={isMe} />
          <div className="member-identity">
            <div className="member-name">
              {member.user.name}
              {isMe && <span className="member-name-tag">You</span>}
            </div>
            <div className="member-email">
              <Mail size={12} />
              {member.user.email}
            </div>
          </div>
        </div>
      </td>
      <td>
        <RoleBadge role={member.role} />
      </td>
      <td style={{ fontSize: 13, color: "var(--text-sub)" }}>
        {toDateLabel(member.joinedAt)}
      </td>
      {canManage && (
        <td>
          <div className="member-actions">
            {!isMe && (
              <Button 
                variant="ghost" 
                size="sm"
                className="member-btn-remove"
                onClick={() => onRemove(member.user.id, member.user.name)} 
                disabled={isUpdating}
                icon={<UserMinus size={14} />}
              >
                Remove
              </Button>
            )}
          </div>
        </td>
      )}
    </tr>
  );
}

function MemberMobileCard({ 
  member, 
  myId, 
  canManage,
  onRemove,
  isUpdating 
}: { 
  member: ProjectMember;
  myId?: string;
  canManage: boolean;
  onRemove: (id: string, name: string) => void;
  isUpdating: boolean;
}) {
  const isMe = member.user.id === myId;

  return (
    <div className="member-card">
      <div className="member-card-header">
        <div className="member-card-identity">
          <MemberAvatar name={member.user.name} isMe={isMe} />
          <div className="member-identity">
            <div className="member-name">
              {member.user.name}
              {isMe && <span className="member-name-tag">You</span>}
            </div>
            <div className="member-email">
              <Mail size={12} />
              {member.user.email}
            </div>
          </div>
        </div>
        <RoleBadge role={member.role} />
      </div>
      
      <div className="member-card-body">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="member-card-detail">
            <span className="member-card-label">Joined Date</span>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{toDateLabel(member.joinedAt)}</div>
          </div>
        </div>

        {canManage && !isMe && (
          <div style={{ marginTop: 12 }}>
            <Button 
              style={{ width: '100%' }} 
              variant="danger" 
              onClick={() => onRemove(member.user.id, member.user.name)} 
              disabled={isUpdating}
              icon={<UserMinus size={14} />}
            >
              Remove from Project
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
