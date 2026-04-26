"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Plus, FolderKanban, Calendar, Users, Globe, Lock, Filter } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useProjectsQuery } from "@/lib/query/project-hooks";
import { useOrganizationBySlug } from "@/lib/query/organization-hooks";
import { getOrgPermissions } from "@/lib/permissions/org-permissions";
import { cn, toDateLabel } from "@/lib/utils";
import type { ProjectStatus } from "@/lib/api/types";

export default function ProjectsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const resolveQuery = useOrganizationBySlug(slug);
  const organizationId = resolveQuery.data?.id;
  const myRole = resolveQuery.data?.myRole;
  const perms = getOrgPermissions(myRole);

  const projectsQuery = useProjectsQuery(organizationId as string);
  const allProjects = projectsQuery.data ?? [];

  // Default filter: PLANNING and ACTIVE
  const [selectedStatuses, setSelectedStatuses] = useState<ProjectStatus[]>(["PLANNING", "ACTIVE"]);
  
  // Filter projects based on selected statuses
  const filteredProjects = allProjects.filter(p => selectedStatuses.includes(p.status));

  const isLoading = resolveQuery.isLoading || (!!organizationId && projectsQuery.isLoading);

  const toggleStatus = (status: ProjectStatus) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const allStatuses: ProjectStatus[] = ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"];
  
  const statusLabels: Record<ProjectStatus, string> = {
    PLANNING: "Planning",
    ACTIVE: "Active",
    ON_HOLD: "On Hold",
    COMPLETED: "Completed",
    ARCHIVED: "Archived",
  };
  
  const statusColors: Record<ProjectStatus, string> = {
    PLANNING: "badge-warning",
    ACTIVE: "badge-success",
    ON_HOLD: "badge-muted",
    COMPLETED: "badge-success",
    ARCHIVED: "badge-muted",
  };

  if (isLoading) {
    return (
      <div className="page-shell">
        <LoadingState rows={5} />
      </div>
    );
  }

  if (resolveQuery.isError || (!resolveQuery.isLoading && !organizationId)) {
    return (
      <div className="page-shell">
        <Alert tone="error">Could not find organization for projects.</Alert>
      </div>
    );
  }

  const projects = filteredProjects;

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-description">Manage and track all projects within {resolveQuery.data?.name}.</p>
        </div>
        {perms.canCreateProject && (
          <Link href={`/organizations/${slug}/projects/new`}>
            <Button icon={<Plus size={18} />}>New Project</Button>
          </Link>
        )}
      </div>

      {/* Status Filter */}
      <div style={{ 
        marginBottom: "24px", 
        padding: "16px", 
        background: "var(--surface-2)", 
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <Filter size={16} style={{ color: "var(--text-muted)" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)" }}>Filter by Status</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {allStatuses.map((status) => {
            const isActive = selectedStatuses.includes(status);
            const count = allProjects.filter(p => p.status === status).length;
            return (
              <button
                key={status}
                onClick={() => toggleStatus(status)}
                className={cn("badge", statusColors[status], !isActive && "badge-muted")}
                style={{
                  cursor: "pointer",
                  opacity: isActive ? 1 : 0.5,
                  border: isActive ? "2px solid currentColor" : "2px solid transparent",
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  transition: "all 150ms ease"
                }}
              >
                {statusLabels[status]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {projectsQuery.isError ? (
        <Alert tone="error">Could not load projects.</Alert>
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description={selectedStatuses.length < allStatuses.length 
            ? "Try adjusting your status filters to see more projects."
            : "Projects help you organize tasks, teams, and timelines."
          }
          actionHref={`/organizations/${slug}/projects/new`}
          actionLabel="Create your first project"
          icon={<FolderKanban size={32} />}
        />
      ) : (
        // Group projects by status
        selectedStatuses.map((status) => {
          const statusProjects = projects.filter(p => p.status === status);
          if (statusProjects.length === 0) return null;
          
          return (
            <div key={status} style={{ marginBottom: "32px" }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "8px", 
                marginBottom: "16px",
                paddingBottom: "8px",
                borderBottom: "2px solid var(--border)"
              }}>
                <div style={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: "50%", 
                  background: status === "PLANNING" ? "var(--warning)" : 
                              status === "ACTIVE" ? "var(--success)" : 
                              status === "ON_HOLD" ? "var(--text-muted)" :
                              status === "COMPLETED" ? "var(--success)" : "var(--text-muted)"
                }} />
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text)" }}>
                  {statusLabels[status]}
                </h2>
                <span className="badge badge-muted" style={{ fontSize: 11 }}>
                  {statusProjects.length} {statusProjects.length === 1 ? "project" : "projects"}
                </span>
              </div>
              
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
                gap: "20px" 
              }}>
                {statusProjects.map((project) => (
                  <Link 
                    key={project.id} 
                    href={`/organizations/${slug}/projects/${project.slug}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div style={{ 
                      height: "100%", 
                      display: "flex", 
                      flexDirection: "column",
                      cursor: "pointer",
                      transition: "transform 150ms ease, box-shadow 150ms ease",
                      borderRadius: "var(--radius-lg)",
                      overflow: "hidden"
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                    }}
                    >
                      <Card padding="0" style={{ height: "100%", display: "flex", flexDirection: "column", border: "none" }}>
                        {/* Project Color Header */}
                        <div style={{ 
                          height: "8px", 
                          background: project.color || "var(--primary)", 
                        }} />
                        
                        <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{project.name}</h3>
                            <div style={{ display: "flex", gap: "6px" }}>
                              {project.visibility === "PRIVATE" ? <Lock size={14} style={{ color: "var(--text-muted)" }} /> : <Globe size={14} style={{ color: "var(--text-muted)" }} />}
                            </div>
                          </div>

                          <p style={{ 
                            fontSize: 13, 
                            color: "var(--text-sub)", 
                            margin: 0,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            minHeight: "40px"
                          }}>
                            {project.description || "No description provided."}
                          </p>

                          <div style={{ marginTop: "auto", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            <span className="badge badge-muted" style={{ fontSize: 10 }}>{project.type}</span>
                            <span className={`badge ${statusColors[project.status]}`} style={{ fontSize: 10 }}>
                              {statusLabels[project.status]}
                            </span>
                          </div>
                        </div>

                        <div style={{ 
                          padding: "12px 20px", 
                          borderTop: "1px solid var(--border)", 
                          background: "var(--surface-2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between"
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: 12 }}>
                            <Calendar size={14} />
                            <span>{toDateLabel(project.targetDate)}</span>
                          </div>
                          {project.lead && (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }} title={`Lead: ${project.lead.name}`}>
                              <div style={{ 
                                width: 24, 
                                height: 24, 
                                borderRadius: "50%", 
                                background: "var(--primary-soft)", 
                                color: "var(--primary)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 10,
                                fontWeight: 700
                              }}>
                                {project.lead.name[0].toUpperCase()}
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
