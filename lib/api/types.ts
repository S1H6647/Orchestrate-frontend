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
  systemRole?: string | null;
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

export type UserResponse = {
  id: string;
  name: string;
  email: string;
  systemRole: string | null;
  status: string | null;
  emailVerified: boolean;
};

export type UserDetailResponse = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  phone: string | null;
  systemRole: string | null;
  status: string | null;
  emailVerified: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  lastLoginAt: string | null;
  authProvider: string | null;
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
export type AllMemberStatus = MemberStatus | "ALL";
export type AllOrganizationRole = OrganizationRole | "ALL";

export type Page<T> = {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

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
  role: "MEMBER" | "VIEWER";
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

export type ProjectRole = "MANAGER" | "CONTRIBUTOR" | "VIEWER";
export type ProjectStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED";
export type ProjectVisibility = "PUBLIC" | "PRIVATE";
export type ProjectType = "BASIC" | "KANBAN" | "SCRUM";

export type ProjectResponse = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  color: string;
  coverImageUrl?: string | null;
  type: ProjectType;
  visibility: ProjectVisibility;
  status: ProjectStatus;
  startDate?: string | null;
  targetDate?: string | null;
  organizationId: string;
  createdBy: { id: string; name: string; email: string };
  lead?: { id: string; name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
  myRole?: ProjectRole;
};

export type ProjectMember = {
  id: string;
  user: { id: string; name: string; email: string };
  role: ProjectRole;
  joinedAt: string;
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

export type UpdateProjectRequest = {
  name?: string;
  description?: string;
  color?: string;
  coverImageUrl?: string;
  visibility?: ProjectVisibility;
  status?: ProjectStatus;
  startDate?: string;
  targetDate?: string;
  leadId?: string;
};

export type AddProjectMemberRequest = {
  userId: string;
  role: ProjectRole;
};

export type TaskStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type TaskPriority = "URGENT" | "HIGH" | "MEDIUM" | "LOW" | "NO_PRIORITY";

export type TaskLabel = {
  id: string;
  name: string;
  color: string;
};

export type SubTask = {
  id: string;
  title: string;
  completed: boolean;
};

export type TaskResponse = {
  id: string;
  identifier: string; // e.g., "ACME-42"
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  storyPoints?: number | null;
  position: number;
  labels: TaskLabel[];
  subTasks: SubTask[];
  parentTask?: { id: string; identifier: string; title: string } | null;
  assignee?: { id: string; name: string; email: string; avatarUrl?: string | null } | null;
  reporter: { id: string; name: string; email: string; avatarUrl?: string | null };
  projectId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateTaskRequest = {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  storyPoints?: number;
  assigneeId?: string;
  parentTaskId?: string;
  labels?: string[]; // label names
};

export type UpdateTaskRequest = {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  storyPoints?: number;
  assigneeId?: string;
  position?: number;
};

export type CreateSubTaskRequest = {
  title: string;
};

export type UpdateSubTaskRequest = {
  title?: string;
  completed?: boolean;
};
