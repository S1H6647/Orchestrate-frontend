import { OrganizationRole } from "@/lib/api/types";

export type OrgPermissions = {
  canViewOverview: boolean;
  canViewMembers: boolean;
  canViewProjects: boolean;
  canCreateProject: boolean;
  canManageOrganizationSettings: boolean;
  canDeleteOrganization: boolean;
  canInviteMembers: boolean;
  canManageInvitations: boolean;
  canChangeMemberRoles: boolean;
  canRemoveMembers: boolean;
  canRestoreMembers: boolean;
  canTransferOwnership: boolean;
};

const ALL_ROLES: OrganizationRole[] = ["OWNER", "ADMIN", "MEMBER", "VIEWER"];
const OWNER_ADMIN: OrganizationRole[] = ["OWNER", "ADMIN"];

const hasRole = (role: string, allowed: OrganizationRole[]) => {
  if (!role) return false;
  return allowed.includes(role.toUpperCase() as OrganizationRole);
};

export function getOrgPermissions(role: string | null | undefined): OrgPermissions {
  const normalizedRole = role?.toUpperCase() ?? "VIEWER";
  
  return {
    // Allowed for all active members
    canViewOverview: hasRole(normalizedRole, ALL_ROLES),
    canViewMembers: hasRole(normalizedRole, ALL_ROLES),
    canViewProjects: hasRole(normalizedRole, ALL_ROLES),
    
    // Owner/Admin only
    canCreateProject: hasRole(normalizedRole, OWNER_ADMIN),
    canManageOrganizationSettings: hasRole(normalizedRole, OWNER_ADMIN),
    canDeleteOrganization: hasRole(normalizedRole, OWNER_ADMIN),
    canInviteMembers: hasRole(normalizedRole, OWNER_ADMIN),
    canManageInvitations: hasRole(normalizedRole, OWNER_ADMIN),
    canChangeMemberRoles: hasRole(normalizedRole, OWNER_ADMIN),
    canRemoveMembers: hasRole(normalizedRole, OWNER_ADMIN),
    canRestoreMembers: hasRole(normalizedRole, OWNER_ADMIN),
    canTransferOwnership: hasRole(normalizedRole, OWNER_ADMIN),
  };
}
