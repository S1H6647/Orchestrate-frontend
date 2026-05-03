"use client";

import { useParams } from "next/navigation";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { LoadingState } from "@/components/ui/loading-state";
import { Alert } from "@/components/ui/alert";
import { useProjectQuery } from "@/lib/query/project-hooks";
import { useOrganizationBySlug } from "@/lib/query/organization-hooks";
import { useTasksQuery } from "@/lib/query/task-hooks";
import { LayoutDashboard, Settings, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProjectBoardPage() {
  const params = useParams<{ slug: string; projectSlug: string }>();
  const { slug, projectSlug } = params;

  const orgResolve = useOrganizationBySlug(slug);
  const organizationId = orgResolve.data?.id;

  const projectQuery = useProjectQuery(organizationId as string, projectSlug);
  const project = projectQuery.data;

  const tasksQuery = useTasksQuery(organizationId as string, projectSlug);
  const tasks = tasksQuery.data || [];

  const isLoading = orgResolve.isLoading || projectQuery.isLoading || tasksQuery.isLoading;
  const isError = orgResolve.isError || projectQuery.isError || tasksQuery.isError;

  if (isLoading) {
    return (
      <div className="page-shell">
        <LoadingState rows={10} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page-shell">
        <Alert tone="error">Failed to load project board. Please try again later.</Alert>
      </div>
    );
  }

  return (
    <div className="page-shell" style={{ maxWidth: "100%", padding: "20px 24px", height: "calc(100vh - 56px)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Board Header */}
      <div className="page-header" style={{ marginBottom: "24px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href={`/organizations/${slug}/projects/${projectSlug}`}>
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>Back</Button>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ 
              width: 36, 
              height: 36, 
              borderRadius: 10, 
              background: project?.color || "var(--primary)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              color: "#fff"
            }}>
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h1 className="page-title" style={{ fontSize: 18 }}>{project?.name} Board</h1>
              <p className="page-description" style={{ fontSize: 12 }}>{project?.type} • {tasks.length} Tasks</p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <Link href={`/organizations/${slug}/projects/${projectSlug}/members`}>
            <Button variant="ghost" size="sm" icon={<Users size={16} />}>Team</Button>
          </Link>
          <Link href={`/organizations/${slug}/projects/${projectSlug}/settings`}>
            <Button variant="ghost" size="sm" icon={<Settings size={16} />}>Settings</Button>
          </Link>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <KanbanBoard 
          organizationId={organizationId as string} 
          projectSlug={projectSlug} 
          tasks={tasks} 
          isLoading={tasksQuery.isLoading}
        />
      </div>
    </div>
  );
}
