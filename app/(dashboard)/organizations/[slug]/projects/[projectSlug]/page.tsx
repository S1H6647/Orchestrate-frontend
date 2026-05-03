"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  FolderKanban, 
  Calendar, 
  Users, 
  Settings as SettingsIcon, 
  Globe, 
  Lock,
  Clock,
  User,
  ArrowRight,
  LayoutDashboard
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { useProjectQuery } from "@/lib/query/project-hooks";
import { useOrganizationBySlug } from "@/lib/query/organization-hooks";
import { toDateLabel } from "@/lib/utils";

export default function ProjectOverviewPage() {
  const params = useParams<{ slug: string; projectSlug: string }>();
  const { slug, projectSlug } = params;

  const orgResolve = useOrganizationBySlug(slug);
  const organizationId = orgResolve.data?.id;

  const projectQuery = useProjectQuery(organizationId as string, projectSlug);
  const project = projectQuery.data;

  const isLoading = orgResolve.isLoading || projectQuery.isLoading;
  const isError = orgResolve.isError || projectQuery.isError || (!isLoading && !project);

  if (isLoading) {
    return (
      <div className="page-shell">
        <LoadingState rows={8} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page-shell">
        <Alert tone="error">Could not find project. It may have been moved or deleted.</Alert>
      </div>
    );
  }

  return (
    <div className="page-shell">
      {/* Project Header */}
      <div className="page-header">
        <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
          <div style={{ 
            width: 56, 
            height: 56, 
            borderRadius: 14, 
            background: project?.color || "var(--primary)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            color: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}>
            <FolderKanban size={28} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 className="page-title">{project?.name}</h1>
              <span className={`badge ${
                project?.status === "ACTIVE" ? "badge-success" : 
                project?.status === "ARCHIVED" ? "badge-muted" : 
                "badge-warning"
              }`}>
                {project?.status}
              </span>
              <span className="badge badge-muted">{project?.visibility}</span>
            </div>
            <p className="page-description">{project?.description || "No description provided."}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link href={`/organizations/${slug}/projects/${projectSlug}/settings`}>
            <Button variant="ghost" size="sm" icon={<SettingsIcon size={16} />}>Settings</Button>
          </Link>
          <Link href={`/organizations/${slug}/projects/${projectSlug}/members`}>
            <Button variant="secondary" size="sm" icon={<Users size={16} />}>Team</Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stat-cards">
        <div className="stat-card">
          <span className="stat-label">Type</span>
          <span className="stat-value" style={{ fontSize: 18 }}>{project?.type}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Target Date</span>
          <span className="stat-value" style={{ fontSize: 18 }}>{toDateLabel(project?.targetDate)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Created</span>
          <span className="stat-value" style={{ fontSize: 18 }}>{toDateLabel(project?.createdAt)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Lead</span>
          <span className="stat-value" style={{ fontSize: 16 }}>{project?.lead?.name || "Unassigned"}</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        <div className="stack" style={{ gap: "24px" }}>
          <Card>
            <div className="card-header">
              <div className="card-title">Project Details</div>
            </div>
            <div className="form-grid two">
              <div className="row" style={{ gap: "12px" }}>
                <Clock size={16} style={{ color: "var(--text-muted)" }} />
                <div className="stack" style={{ gap: "2px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Start Date</span>
                  <span style={{ fontSize: 14 }}>{toDateLabel(project?.startDate)}</span>
                </div>
              </div>
              <div className="row" style={{ gap: "12px" }}>
                <Calendar size={16} style={{ color: "var(--text-muted)" }} />
                <div className="stack" style={{ gap: "2px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Target Date</span>
                  <span style={{ fontSize: 14 }}>{toDateLabel(project?.targetDate)}</span>
                </div>
              </div>
              <div className="row" style={{ gap: "12px" }}>
                {project?.visibility === "PRIVATE" ? <Lock size={16} style={{ color: "var(--text-muted)" }} /> : <Globe size={16} style={{ color: "var(--text-muted)" }} />}
                <div className="stack" style={{ gap: "2px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Visibility</span>
                  <span style={{ fontSize: 14 }}>{project?.visibility === "PRIVATE" ? "Private (Invite Only)" : "Public (Organization Wide)"}</span>
                </div>
              </div>
              <div className="row" style={{ gap: "12px" }}>
                <User size={16} style={{ color: "var(--text-muted)" }} />
                <div className="stack" style={{ gap: "2px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Created By</span>
                  <span style={{ fontSize: 14 }}>{project?.createdBy.name}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Access to Views (Placeholder for future Project specific views) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Link href={`/organizations/${slug}/projects/${projectSlug}/board`} style={{ textDecoration: "none" }}>
              <Card padding="16px" style={{ cursor: "pointer" }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div className="row" style={{ gap: "12px" }}>
                    <div style={{ padding: "8px", borderRadius: "8px", background: "var(--primary-soft)", color: "var(--primary)" }}>
                      <LayoutDashboard size={20} />
                    </div>
                    <span style={{ fontWeight: 600 }}>Tasks Board</span>
                  </div>
                  <ArrowRight size={16} style={{ color: "var(--text-muted)" }} />
                </div>
              </Card>
            </Link>
            <Card padding="16px" style={{ cursor: "pointer" }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div className="row" style={{ gap: "12px" }}>
                  <div style={{ padding: "8px", borderRadius: "8px", background: "var(--success-soft)", color: "var(--success)" }}>
                    <Users size={20} />
                  </div>
                  <span style={{ fontWeight: 600 }}>Team Chat</span>
                </div>
                <ArrowRight size={16} style={{ color: "var(--text-muted)" }} />
              </div>
            </Card>
          </div>
        </div>

        <div className="stack" style={{ gap: "24px" }}>
          <Card>
            <div className="card-header">
              <div className="card-title">Project Lead</div>
            </div>
            {project?.lead ? (
              <div className="row" style={{ gap: "12px" }}>
                <div style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: "50%", 
                  background: "var(--primary-soft)", 
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700
                }}>
                  {project.lead.name[0].toUpperCase()}
                </div>
                <div className="stack" style={{ gap: "2px" }}>
                  <span style={{ fontWeight: 600 }}>{project.lead.name}</span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{project.lead.email}</span>
                </div>
              </div>
            ) : (
              <div style={{ padding: "12px", border: "1px dashed var(--border)", borderRadius: "var(--radius)", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                No project lead assigned
              </div>
            )}
          </Card>

          <Card>
            <div className="card-header">
              <div className="card-title">Quick Actions</div>
            </div>
            <div className="stack" style={{ gap: "8px" }}>
              <Link href={`/organizations/${slug}/projects/${projectSlug}/members`} style={{ width: "100%" }}>
                <Button variant="ghost" style={{ width: "100%", justifyContent: "flex-start" }} icon={<Users size={16} />}>Manage Team</Button>
              </Link>
              <Link href={`/organizations/${slug}/projects/${projectSlug}/settings`} style={{ width: "100%" }}>
                <Button variant="ghost" style={{ width: "100%", justifyContent: "flex-start" }} icon={<SettingsIcon size={16} />}>Project Settings</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
