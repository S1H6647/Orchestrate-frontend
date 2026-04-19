import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const orgSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name cannot exceed 100 characters"),
  slug: z
    .string()
    .max(100, "Slug cannot exceed 100 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens")
    .optional()
    .or(z.literal("")),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional().or(z.literal("")),
  websiteUrl: z.string().max(255, "Website URL cannot exceed 255 characters").optional().or(z.literal("")),
  logoUrl: z.string().max(255, "Logo URL cannot exceed 255 characters").optional().or(z.literal("")),
});

export const inviteSchema = z.object({
  email: z.string().email("Enter a valid email"),
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]),
});

export const projectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
  description: z.string().max(1000, "Description cannot exceed 1000 characters").optional().or(z.literal("")),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must match #RRGGBB")
    .optional()
    .or(z.literal("")),
  type: z.enum(["BASIC", "KANBAN", "SCRUM"]),
  visibility: z.enum(["PUBLIC", "PRIVATE"]),
  startDate: z.string().optional().or(z.literal("")),
  targetDate: z.string().optional().or(z.literal("")),
});
