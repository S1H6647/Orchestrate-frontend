export const queryKeys = {
  me: ["me"] as const,
  organizations: ["organizations"] as const,
  organization: (organizationId: string) => ["organization", organizationId] as const,
  members: (organizationId: string) => ["members", organizationId] as const,
  invitations: (organizationId: string) => ["invitations", organizationId] as const,
  projects: (organizationId: string) => ["projects", organizationId] as const,
  tasks: (organizationId: string, projectSlug: string) => ["projects", organizationId, projectSlug, "tasks"] as const,
  myOrganizationContext: ["organizations", "me"] as const,
  myInvitations: ["invitations", "me"] as const,
};
