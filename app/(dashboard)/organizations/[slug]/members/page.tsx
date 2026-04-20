"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { UserPlus, Shield, User, Ghost, ArrowRight, Mail, Calendar, CheckCircle2, MinusCircle, UserMinus } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { Pagination } from "@/components/ui/pagination";
import { MembersFilterBar } from "@/components/organizations/members-filter-bar";
import { OrganizationRole, OrganizationMember, MemberStatus } from "@/lib/api/types";
import { useMeQuery } from "@/lib/query/auth-hooks";
import {
  useOrganizationBySlug,
  useOrganizationMembersQuery,
  useRemoveMemberMutation,
  useRestoreMemberMutation,
  useUpdateRoleMutation,
} from "@/lib/query/organization-hooks";
import { getOrgPermissions } from "@/lib/permissions/org-permissions";
import { useMembersParams } from "@/lib/hooks/use-members-params";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { isStrictlyHigherRole } from "@/lib/auth/roles";

export default function MembersPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { push } = useToast();
  const { params: queryParams, setParams } = useMembersParams();
  
  const [searchInput, setSearchInput] = useState(queryParams.q);
  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    if (debouncedSearch !== queryParams.q) {
      setParams({ q: debouncedSearch });
    }
  }, [debouncedSearch, queryParams.q, setParams]);

  const resolveQuery = useOrganizationBySlug(slug);
  const organizationId = resolveQuery.data?.id;

  const meQuery = useMeQuery();
  const membersQuery = useOrganizationMembersQuery(organizationId as string, queryParams);
  
  const updateRoleMutation = useUpdateRoleMutation(organizationId as string);
  const removeMutation = useRemoveMemberMutation(organizationId as string);
  const restoreMutation = useRestoreMemberMutation(organizationId as string);

  const myRole = resolveQuery.data?.myRole;
  const perms = getOrgPermissions(myRole as any);

  const isLoading = resolveQuery.isLoading || (!!organizationId && membersQuery.isLoading);

  const handleRoleChange = async (member: OrganizationMember, newRole: OrganizationRole) => {
    try {
      await updateRoleMutation.mutateAsync({ userId: member.user.id, role: newRole });
      push({ title: "Role updated", kind: "success" });
    } catch (err: any) {
      push({ title: "Failed to update role", message: err.message, kind: "error" });
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      await removeMutation.mutateAsync(userId);
      push({ title: "Member removed", kind: "success" });
    } catch (err: any) {
      push({ title: "Failed to remove member", message: err.message, kind: "error" });
    }
  };

  const handleRestore = async (userId: string) => {
    try {
      await restoreMutation.mutateAsync(userId);
      push({ title: "Member restored", kind: "success" });
    } catch (err: any) {
      push({ title: "Failed to restore member", message: err.message, kind: "error" });
    }
  };

  if (isLoading && !membersQuery.data) {
    return (
      <div className="page-shell">
        <LoadingState rows={8} />
      </div>
    );
  }

  if (resolveQuery.isError) {
    return (
      <div className="page-shell">
        <Alert tone="error">Organization not found or access denied.</Alert>
        <Link href="/organizations" style={{ marginTop: 16, display: 'inline-block' }}>
          <Button variant="ghost">Back to Organizations</Button>
        </Link>
      </div>
    );
  }

  const { content: members = [], totalPages = 0, totalElements = 0 } = membersQuery.data || {};
  const isEmpty = members.length === 0;

  return (
    <div className="page-shell">
      <div className="page-header animate-in fade-in duration-500">
        <div>
          <h1 className="page-title row">
            Members
          </h1>
          <p className="page-description">
            Manage your organization&apos;s team, define roles, and control access levels easily.
          </p>
        </div>
        {perms.canInviteMembers && (
          <Link href={`/organizations/${slug}/invitations`}>
            <Button variant="primary" icon={<UserPlus size={16} />}>
              Invite New Member
            </Button>
          </Link>
        )}
      </div>

      <div className="animate-in slide-in-from-bottom-5 duration-500" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
        <MembersFilterBar
          search={searchInput}
          status={queryParams.status}
          role={queryParams.role}
          onSearchChange={setSearchInput}
          onStatusChange={(status) => setParams({ status })}
          onRoleChange={(role) => setParams({ role })}
        />
      </div>

      {membersQuery.isError && (
        <Alert tone="error" style={{ marginBottom: 24 }}>
          Something went wrong while fetching members. Please refresh and try again.
        </Alert>
      )}

      {isEmpty && !isLoading ? (
        <div className="animate-in zoom-in duration-700" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          <EmptyState
            title="No matches found"
            description={searchInput || queryParams.status !== 'ACTIVE' || queryParams.role !== 'ALL' 
              ? "We couldn't find any members matching your filters. Try clearing some selections." 
              : "The guest list is empty. Start by inviting your first team member!"}
            icon={<Ghost size={32} />}
          />
          {(searchInput || queryParams.status !== 'ACTIVE' || queryParams.role !== 'ALL') && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchInput("");
                  setParams({ status: 'ACTIVE', role: 'ALL', q: '' });
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="animate-in slide-in-from-bottom-5 duration-500" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          {/* Desktop Table View */}
          <div className="table-wrapper" style={{ display: "none" }}>
             {/* This hides table on mobile purely without tailwind */}
          </div>
          
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

          <div className="table-wrapper desktop-table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Member Identity</th>
                  <th>Access Level</th>
                  <th>Current Status</th>
                  <th style={{ textAlign: 'right' }}>Operations</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <MemberRow 
                    key={member.user.id} 
                    member={member} 
                    myEmail={meQuery.data?.email}
                    myRole={myRole}
                    perms={perms}
                    onRoleChange={handleRoleChange}
                    onRemove={handleRemove}
                    onRestore={handleRestore}
                    isUpdating={updateRoleMutation.isPending || removeMutation.isPending || restoreMutation.isPending}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Cards View */}
          <div className="stack mobile-cards" style={{ gap: 16, display: 'none', flexDirection: 'column' }}>
            {members.map((member) => (
              <MemberMobileCard 
                key={member.user.id} 
                member={member}
                myEmail={meQuery.data?.email}
                myRole={myRole}
                perms={perms}
                onRoleChange={handleRoleChange}
                onRemove={handleRemove}
                onRestore={handleRestore}
                isUpdating={updateRoleMutation.isPending || removeMutation.isPending || restoreMutation.isPending}
              />
            ))}
          </div>

          <Pagination
            currentPage={queryParams.page}
            totalPages={totalPages}
            pageSize={queryParams.size}
            totalElements={totalElements}
            onPageChange={(page) => setParams({ page })}
            onPageSizeChange={(size) => setParams({ size })}
          />
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

function RoleBadge({ role }: { role: OrganizationRole }) {
  const badgeClass = `badge badge-${role.toLowerCase()}`;
  return (
    <span className={badgeClass}>
      {role}
    </span>
  );
}

function StatusBadge({ status }: { status: MemberStatus }) {
  const styles: Record<MemberStatus, string> = {
    ACTIVE: "badge-success",
    INVITED: "badge-warning",
    REMOVED: "badge-danger",
  };
  return (
    <span className={`badge ${styles[status]}`}>
      {status}
    </span>
  );
}

function MemberRow({ 
  member, 
  myEmail, 
  myRole, 
  perms, 
  onRoleChange, 
  onRemove, 
  onRestore,
  isUpdating,
}: { 
  member: OrganizationMember;
  myEmail?: string;
  myRole?: OrganizationRole;
  perms: ReturnType<typeof getOrgPermissions>;
  onRoleChange: (member: OrganizationMember, role: OrganizationRole) => void;
  onRemove: (id: string) => void;
  onRestore: (id: string) => void;
  isUpdating: boolean;
}) {
  const isMe = member.user.email === myEmail;
  const canMutate = !!myRole && !isMe && isStrictlyHigherRole(myRole, member.role);
  
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
        {perms.canChangeMemberRoles && canMutate && member.status !== 'REMOVED' ? (
          <div className="member-role-select-wrapper">
            <select 
              className="member-role-select"
              value={member.role}
              disabled={isUpdating}
              onChange={(e) => onRoleChange(member, e.target.value as OrganizationRole)}
            >
              <option value="ADMIN">ADMIN</option>
              <option value="MEMBER">MEMBER</option>
              <option value="VIEWER">VIEWER</option>
            </select>
            <ArrowRight className="member-role-select-icon" />
          </div>
        ) : (
          <RoleBadge role={member.role} />
        )}
      </td>
      <td>
        <StatusBadge status={member.status} />
      </td>
      <td>
        <div className="member-actions">
          {perms.canRemoveMembers && canMutate && (
            member.status === 'REMOVED' ? (
               <Button 
                 variant="ghost" 
                 size="sm"
                 className="member-btn-restore"
                 onClick={() => onRestore(member.user.id)} 
                 disabled={isUpdating}
               >
                 Restore
               </Button>
            ) : (
               <Button 
                 variant="ghost" 
                 size="sm"
                 className="member-btn-remove"
                 onClick={() => onRemove(member.user.id)} 
                 disabled={isUpdating}
                 icon={<UserMinus size={14} />}
               >
                 Remove
               </Button>
            )
          )}
        </div>
      </td>
    </tr>
  );
}

function MemberMobileCard({ 
  member, 
  myEmail, 
  myRole, 
  perms, 
  onRoleChange, 
  onRemove, 
  onRestore,
  isUpdating 
}: { 
  member: OrganizationMember;
  myEmail?: string;
  myRole?: OrganizationRole;
  perms: ReturnType<typeof getOrgPermissions>;
  onRoleChange: (member: OrganizationMember, role: OrganizationRole) => void;
  onRemove: (id: string) => void;
  onRestore: (id: string) => void;
  isUpdating: boolean;
}) {
  const isMe = member.user.email === myEmail;
  const canMutate = !!myRole && !isMe && isStrictlyHigherRole(myRole, member.role);

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
        <StatusBadge status={member.status} />
      </div>
      
      <div className="member-card-body">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="member-card-detail">
            <span className="member-card-label">Access Role</span>
            {perms.canChangeMemberRoles && canMutate && member.status !== 'REMOVED' ? (
              <div className="member-role-select-wrapper">
                <select 
                  className="member-role-select"
                  value={member.role}
                  disabled={isUpdating}
                  onChange={(e) => onRoleChange(member, e.target.value as OrganizationRole)}
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="MEMBER">MEMBER</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
                <ArrowRight className="member-role-select-icon" />
              </div>
            ) : (
              <RoleBadge role={member.role} />
            )}
          </div>
        </div>

        {perms.canRemoveMembers && canMutate && (
          <div style={{ marginTop: 8 }}>
            {member.status === 'REMOVED' ? (
              <Button style={{ width: '100%' }} variant="outline" className="member-btn-restore" onClick={() => onRestore(member.user.id)} disabled={isUpdating}>
                Restore Member
              </Button>
            ) : (
              <Button style={{ width: '100%' }} variant="danger" onClick={() => onRemove(member.user.id)} disabled={isUpdating}>
                Remove from Organization
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
