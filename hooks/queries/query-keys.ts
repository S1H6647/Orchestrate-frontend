export const adminQueryKeys = {
  users: (page: number, size: number, q: string) => ["users", page, size, q] as const,
  organizations: (page: number, size: number, q: string) => ["organizations", page, size, q] as const,
};
