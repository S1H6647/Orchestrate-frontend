export type ApiErrorCode =
  | "Unauthorized"
  | "Forbidden"
  | "Not Found"
  | "Conflict"
  | "Validation Failed"
  | "Bad Request"
  | "Internal Server Error";

export type ApiErrorResponse = {
  timestamp: string;
  success: false;
  status: number;
  error: ApiErrorCode;
  message: string;
  errors?: Record<string, string>;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  phone?: string | null;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  id: string;
  name: string;
  email: string;
  systemRole: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  id: string;
  name: string;
  email: string;
};

export type SuccessResponse = {
  success: true;
  message: string;
};

export type OrganizationRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
export type OrganizationStatus = "ACTIVE" | "SUSPENDED" | "DELETED";
export type Plan = "FREE" | "PRO" | "ENTERPRISE";
export type MemberStatus = "ACTIVE" | "INVITED" | "REMOVED";

export type OrganizationResponse = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  plan: Plan;
  maxMembers: number;
  maxProjects: number;
  status: OrganizationStatus;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type OrganizationSummary = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  plan: Plan;
  status: OrganizationStatus;
  myRole: OrganizationRole;
  membershipStatus: MemberStatus;
};

export type CreateOrganizationRequest = {
  name: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
};

export type UpdateOrganizationProfileRequest = {
  description?: string;
  websiteUrl?: string;
  logoUrl?: string;
};

export type UpdateOrganizationIdentityRequest = {
  name: string;
  slug: string;
};

export type OrganizationMember = {
  user: {
    id: string;
    name: string;
    email: string;
  };
  status: MemberStatus;
  role: OrganizationRole;
};

export type InviteMemberRequest = {
  email: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
};

export type InvitationResponse = {
  email: string;
  role: OrganizationRole;
  token: string;
  expiresAt: string;
  status: string;
};

export type MyInvitationResponse = {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  role: OrganizationRole;
  token: string;
  expiresAt: string;
  status: MemberStatus;
};

export type MemberAddedToOrganizationResponse = {
  memberId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  role: OrganizationRole;
  status: MemberStatus;
  joinedAt: string;
};

export type UpdateMemberRoleRequest = {
  role: OrganizationRole;
};

export type ProjectType = "BASIC" | "KANBAN" | "SCRUM";
export type ProjectVisibility = "PUBLIC" | "PRIVATE";
export type ProjectStatus =
  | "PLANNING"
  | "ACTIVE"
  | "ON_HOLD"
  | "COMPLETED"
  | "ARCHIVED";
export type ProjectRole = "MANAGER" | "CONTRIBUTOR" | "VIEWER";

export type ProjectResponse = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  color?: string | null;
  coverImageUrl?: string | null;
  type: ProjectType;
  visibility: ProjectVisibility;
  status: ProjectStatus;
  startDate?: string | null;
  targetDate?: string | null;
  organizationId: string;
  createdBy: string;
  lead?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectRequest = {
  name: string;
  description?: string;
  color?: string;
  type: ProjectType;
  visibility: ProjectVisibility;
  startDate?: string;
  targetDate?: string;
};
