"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Settings, Users, Mail, FolderKanban, Calendar, Globe, Hash, ArrowRight } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import {
  useOrganizationQuery,
  useOrganizationBySlug,
} from "@/lib/query/organization-hooks";
import { getOrgPermissions } from "@/lib/permissions/org-permissions";
import { toDateLabel } from "@/lib/utils";

const getQuickLinks = (slug: string, perms: ReturnType<typeof getOrgPermissions>) => {
  const links = [
    { href: `/organizations/${slug}/members`, icon: <Users size={16} />, label: "Members", desc: "View and manage members" },
    { href: `/organizations/${slug}/projects`, icon: <FolderKanban size={16} />, label: "Projects", desc: "Browse all projects" },
  ];

  if (perms.canManageOrganizationSettings) {
    links.unshift({ 
      href: `/organizations/${slug}/settings`, 
      icon: <Settings size={16} />, 
      label: "Settings", 
      desc: "Manage organization settings" 
    });
  }

  if (perms.canManageInvitations) {
    links.push({ 
      href: `/organizations/${slug}/invitations`, 
      icon: <Mail size={16} />, 
      label: "Invitations", 
      desc: "Pending & sent invitations" 
    });
  }

  return links;
};

export default function OrganizationDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const resolveQuery = useOrganizationBySlug(slug);
  const organizationId = resolveQuery.data?.id;
  const myRole = (resolveQuery.data as any)?.myRole;
  const perms = getOrgPermissions(myRole);

  const organizationQuery = useOrganizationQuery(organizationId as string);

  const isLoading = resolveQuery.isLoading || (!!organizationId && organizationQuery.isLoading);
  const isError = resolveQuery.isError || (!resolveQuery.isLoading && !organizationId) || organizationQuery.isError;

  if (isLoading) {
    return (
      <div className="page-shell">
        <LoadingState rows={5} />
      </div>
    );
  }

  if (isError || !organizationQuery.data) {
    return (
      <div className="page-shell">
        <Alert tone="error">Could not load organization details.</Alert>
      </div>
    );
  }

  const org = organizationQuery.data;

  return (
    <div className="page-shell">
      {/* Header */}
      <div className="page-header">
        <div className="row" style={{ gap: "16px", alignItems: "flex-start" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "var(--primary-soft)",
              border: "1px solid rgba(91,108,249,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--primary)",
              fontWeight: 800,
              fontSize: 22,
              flexShrink: 0,
            }}
          >
            {org.name[0].toUpperCase()}
          </div>
          <div>
            <div className="row" style={{ gap: "10px", alignItems: "center" }}>
              <h1 className="page-title">{org.name}</h1>
              <span className={`badge ${org.status === "ACTIVE" ? "badge-success" : "badge-muted"}`}>{org.status}</span>
              <span className="badge badge-primary">{org.plan}</span>
            </div>
            <p className="page-description">{org.description || "No description provided."}</p>
          </div>
        </div>
        {perms.canManageOrganizationSettings && (
          <Link href={`/organizations/${slug}/settings`}>
            <Button variant="ghost" size="sm" icon={<Settings size={14} />}>Settings</Button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="stat-cards">
        <div className="stat-card">
          <span className="stat-label">Max Members</span>
          <span className="stat-value">{org.maxMembers}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Max Projects</span>
          <span className="stat-value">{org.maxProjects}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Created</span>
          <span className="stat-value" style={{ fontSize: 16 }}>{toDateLabel(org.createdAt)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Last Updated</span>
          <span className="stat-value" style={{ fontSize: 16 }}>{toDateLabel(org.updatedAt)}</span>
        </div>
      </div>

      {/* Details */}
      <Card>
        <div className="card-header">
          <div>
            <div className="card-title">Organization Details</div>
          </div>
        </div>
        <div className="form-grid two">
          <div className="row" style={{ gap: "10px" }}>
            <Hash size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            <div className="stack" style={{ gap: "1px" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Slug</span>
              <span style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text)" }}>{org.slug}</span>
            </div>
          </div>
          <div className="row" style={{ gap: "10px" }}>
            <Globe size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            <div className="stack" style={{ gap: "1px" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Website</span>
              <span style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text)" }}>{org.websiteUrl ?? "—"}</span>
            </div>
          </div>
          <div className="row" style={{ gap: "10px" }}>
            <Calendar size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            <div className="stack" style={{ gap: "1px" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Created At</span>
              <span style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text)" }}>{toDateLabel(org.createdAt)}</span>
            </div>
          </div>
          <div className="row" style={{ gap: "10px" }}>
            <Calendar size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            <div className="stack" style={{ gap: "1px" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Updated At</span>
              <span style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text)" }}>{toDateLabel(org.updatedAt)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Links */}
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "var(--text)" }}>Quick Access</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
          {getQuickLinks(slug, perms).map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className="card"
                style={{
                  padding: "16px 20px",
                  cursor: "pointer",
                  transition: "all 160ms ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--primary)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 3px var(--primary-ring)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "";
                }}
              >
                <div className="row" style={{ gap: "10px" }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: "var(--primary-soft)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--primary)",
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{item.desc}</div>
                  </div>
                </div>
                <ArrowRight size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
