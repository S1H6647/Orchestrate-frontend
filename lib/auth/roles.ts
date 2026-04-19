import { MEMBER_ROLE_LEVEL } from "@/lib/api/constants";
import { OrganizationRole } from "@/lib/api/types";

export function isStrictlyHigherRole(actor: OrganizationRole, target: OrganizationRole) {
  return (MEMBER_ROLE_LEVEL[actor] ?? 0) > (MEMBER_ROLE_LEVEL[target] ?? 0);
}

export function canManageMembers(role: OrganizationRole | null | undefined) {
  return role === "OWNER" || role === "ADMIN";
}
