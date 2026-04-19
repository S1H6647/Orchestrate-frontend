"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus, FolderKanban } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useProjectsQuery } from "@/lib/query/project-hooks";
import { useOrganizationBySlug } from "@/lib/query/organization-hooks";
import { toDateLabel } from "@/lib/utils";

export default function ProjectsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const resolveQuery = useOrganizationBySlug(slug);
  const organizationId = resolveQuery.data?.id;

  const projectsQuery = useProjectsQuery(organizationId as string);

  const isLoading = resolveQuery.isLoading || (!!organizationId && projectsQuery.isLoading);

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

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-description">Track all projects available in this organization.</p>
        </div>
        <Link href={`/organizations/${slug}/projects/new`}>
          <Button icon={<Plus size={18} />}>Create project</Button>
        </Link>
      </div>

      {projectsQuery.isError ? (
        <Alert tone="error">Could not load projects.</Alert>
      ) : (projectsQuery.data?.length ?? 0) === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Start by creating a project for your team."
          actionHref={`/organizations/${slug}/projects/new`}
          actionLabel="Create project"
          icon={<FolderKanban size={24} />}
        />
      ) : (
        <Card padding="0">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Type</th>
                  <th>Visibility</th>
                  <th>Status</th>
                  <th>Target Date</th>
                </tr>
              </thead>
              <tbody>
                {projectsQuery.data?.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <div className="table-name">{project.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                        {project.description || "No description"}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-muted">{project.type}</span>
                    </td>
                    <td>
                      <span className="badge badge-muted">{project.visibility}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${project.status === "ACTIVE" ? "badge-success" : project.status === "ARCHIVED" ? "badge-muted" : "badge-warning"}`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-sub)", fontSize: 13 }}>
                      {toDateLabel(project.targetDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
