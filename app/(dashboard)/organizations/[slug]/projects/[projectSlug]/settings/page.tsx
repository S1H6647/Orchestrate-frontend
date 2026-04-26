"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Settings as SettingsIcon, Save, Archive, AlertTriangle, Loader2, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Select } from "@/components/ui/select";
import { LoadingState } from "@/components/ui/loading-state";
import { useProjectQuery, useUpdateProjectMutation, useArchiveProjectMutation, useDeleteProjectMutation } from "@/lib/query/project-hooks";
import { useOrganizationBySlug } from "@/lib/query/organization-hooks";
import { ProjectStatus, ProjectVisibility } from "@/lib/api/types";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ApiClientError } from "@/lib/api/error";
import { useToast } from "@/components/ui/toast";

export default function ProjectSettingsPage() {
  const router = useRouter();
  const params = useParams<{ slug: string; projectSlug: string }>();
  const { slug, projectSlug } = params;
  const { push } = useToast();

  const orgResolve = useOrganizationBySlug(slug);
  const organizationId = orgResolve.data?.id;

  const projectQuery = useProjectQuery(organizationId as string, projectSlug);
  const project = projectQuery.data;

  const updateMutation = useUpdateProjectMutation(organizationId as string, projectSlug);
  const archiveMutation = useArchiveProjectMutation(organizationId as string, projectSlug);
  const deleteMutation = useDeleteProjectMutation(organizationId as string, projectSlug);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "",
    visibility: "PRIVATE" as ProjectVisibility,
    status: "ACTIVE" as ProjectStatus,
    startDate: "",
    targetDate: "",
  });

  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || "",
        color: project.color,
        visibility: project.visibility,
        status: project.status,
        startDate: project.startDate || "",
        targetDate: project.targetDate || "",
      });
    }
  }, [project]);

  const canManage = project?.myRole === "MANAGER" || orgResolve.data?.myRole === "OWNER" || orgResolve.data?.myRole === "ADMIN";

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData, {
      onSuccess: () => {
        push({ title: "Project settings updated successfully.", kind: "success" });
      },
      onError: (err) => {
        push({ 
          title: "Failed to update project", 
          description: err instanceof ApiClientError ? err.message : "Please try again.",
          kind: "error" 
        });
      }
    });
  };

  const handleArchive = () => {
    if (!organizationId) {
      console.warn("Organization ID is missing");
      return;
    }

    archiveMutation.mutate(undefined, {
      onSuccess: () => {
        push({ title: "Project archived successfully.", kind: "success" });
        router.push(`/organizations/${slug}/projects`);
      },
      onError: (err) => {
        push({ 
          title: "Failed to archive project", 
          description: err instanceof ApiClientError ? err.message : "Please check your permissions and try again.",
          kind: "error" 
        });
        setShowArchiveDialog(false);
      }
    });
  };

  const handleDelete = () => {
    if (!organizationId || deleteConfirmInput !== project?.name) return;
    deleteMutation.mutate(
      { name: project!.name },
      {
        onSuccess: () => {
          push({ title: `"${project!.name}" has been permanently deleted.`, kind: "success" });
          router.push(`/organizations/${slug}/projects`);
        },
        onError: (err) => {
          push({
            title: "Failed to delete project",
            description: err instanceof ApiClientError ? err.message : "Please check your permissions and try again.",
            kind: "error",
          });
          setShowDeleteDialog(false);
        },
      }
    );
  };

  if (orgResolve.isLoading || projectQuery.isLoading) {
    return <div className="page-shell"><LoadingState rows={5} /></div>;
  }

  if (!canManage) {
    return (
      <div className="page-shell">
        <Alert tone="error">You do not have permission to access project settings.</Alert>
      </div>
    );
  }

  const colors = [
    "#5b6cf9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
    "#ec4899", "#06b6d4", "#f97316", "#64748b"
  ];

  return (
    <div className="page-shell">
      <ConfirmDialog
        open={showArchiveDialog}
        title="Archive Project"
        description={`Are you sure you want to archive ${project?.name}? It will become read-only for all members.`}
        confirmLabel="Archive Now"
        tone="danger"
        onConfirm={handleArchive}
        onCancel={() => setShowArchiveDialog(false)}
        loading={archiveMutation.isPending}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete Project Permanently"
        description="This action cannot be undone. All project data, members, and settings will be permanently removed."
        confirmLabel="Delete Permanently"
        tone="danger"
        onConfirm={handleDelete}
        onCancel={() => { setShowDeleteDialog(false); setDeleteConfirmInput(""); }}
        loading={deleteMutation.isPending}
        confirmDisabled={deleteConfirmInput !== project?.name || deleteMutation.isPending}
      >
        <div className="stack" style={{ gap: 12 }}>
          <div style={{ padding: "12px", background: "var(--danger-soft)", borderRadius: "var(--radius)", border: "1px solid var(--danger-border)" }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--danger-text)", marginBottom: 4 }}>This action is irreversible!</p>
            <p style={{ fontSize: "12.5px", color: "var(--danger-text)", opacity: 0.9 }}>
              All tasks, members, and settings tied to this project will be permanently removed.
            </p>
          </div>
          <div className="stack" style={{ gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>
              Type <strong style={{ color: "var(--danger-text)" }}>{project?.name}</strong> to confirm
            </label>
            <input
              className="input"
              value={deleteConfirmInput}
              onChange={(e) => setDeleteConfirmInput(e.target.value)}
              placeholder={project?.name}
              autoComplete="off"
            />
          </div>
        </div>
      </ConfirmDialog>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href={`/organizations/${slug}/projects/${projectSlug}`}>
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />} />
          </Link>
          <div>
            <h1 className="page-title">Project Settings</h1>
            <p className="page-description">Configure metadata and lifecycle for <strong>{project?.name}</strong>.</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "800px", display: "grid", gap: "32px" }}>
        <form onSubmit={handleUpdate}>
          <Card>
            <div className="stack" style={{ gap: "24px" }}>
              <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
                  <FormField label="Project Name" required>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </FormField>

                  <FormField label="Description">
                    <textarea
                      className="input"
                      style={{ height: "100px", padding: "10px", resize: "vertical" }}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </FormField>
                </div>

                <div className="stack" style={{ gap: "12px", width: "160px" }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Project Color</span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                    {colors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: c })}
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: c,
                          border: formData.color === c ? "2px solid var(--text)" : "2px solid transparent",
                          cursor: "pointer",
                          transition: "all 150ms ease",
                          padding: 0
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-grid two">
                <FormField label="Visibility">
                  <Select
                    value={formData.visibility}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value as ProjectVisibility })}
                    options={[
                      { label: "Private (Invite only)", value: "PRIVATE" },
                      { label: "Public (All org members)", value: "PUBLIC" },
                    ]}
                  />
                </FormField>

                <FormField label="Status">
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                    options={[
                      { label: "Planning", value: "PLANNING" },
                      { label: "Active", value: "ACTIVE" },
                      { label: "On Hold", value: "ON_HOLD" },
                      { label: "Completed", value: "COMPLETED" },
                      { label: "Archived", value: "ARCHIVED" },
                    ]}
                  />
                </FormField>
              </div>

              <div className="form-grid two">
                <FormField label="Start Date">
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </FormField>

                <FormField label="Target Date">
                  <Input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  />
                </FormField>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending || !formData.name}
                  icon={updateMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
        </form>

        <Card style={{ border: "1px solid var(--danger)", background: "rgba(239, 68, 68, 0.02)" }}>
          <div className="stack" style={{ gap: "20px" }}>
            <div className="row" style={{ gap: "12px", color: "var(--danger)" }}>
              <AlertTriangle size={20} />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Danger Zone</h3>
            </div>

            {/* Archive */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, paddingBottom: 20, borderBottom: "1px solid var(--border)" }}>
              <div className="stack" style={{ gap: 4 }}>
                <p style={{ fontSize: 14, fontWeight: 600 }}>Archive this project</p>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  Marks the project as read-only. Reversible by changing status back to Active.
                </p>
              </div>
              <Button
                variant="outline"
                icon={archiveMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Archive size={16} />}
                onClick={() => setShowArchiveDialog(true)}
                style={{ flexShrink: 0 }}
              >
                Archive
              </Button>
            </div>

            {/* Delete */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div className="stack" style={{ gap: 4 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--danger-text)" }}>Delete this project</p>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  Permanently removes the project and all associated data. This cannot be undone.
                </p>
              </div>
              <Button
                variant="danger"
                icon={deleteMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                onClick={() => setShowDeleteDialog(true)}
                style={{ flexShrink: 0 }}
              >
                Delete
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
