"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { FolderKanban, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { LoadingState } from "@/components/ui/loading-state";
import { useToast } from "@/components/ui/toast";
import { useCreateProjectMutation } from "@/lib/query/project-hooks";
import { useOrganizationBySlug } from "@/lib/query/organization-hooks";
import { ProjectType, ProjectVisibility } from "@/lib/api/types";

export default function CreateProjectPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { push } = useToast();

  const orgResolve = useOrganizationBySlug(slug);
  const organizationId = orgResolve.data?.id;

  const createMutation = useCreateProjectMutation(organizationId as string);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "BASIC" as ProjectType,
    visibility: "PRIVATE" as ProjectVisibility,
    color: "#5b6cf9",
    startDate: "",
    targetDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId) return;

    try {
      const project = await createMutation.mutateAsync(formData);
      push({ title: "Project created", kind: "success" });
      router.push(`/organizations/${slug}/projects/${project.slug}`);
    } catch (err) {
      push({ 
        title: "Creation failed", 
        description: err instanceof Error ? err.message : "Failed to create project. Please try again.", 
        kind: "error" 
      });
    }
  };

  const colors = [
    "#5b6cf9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", 
    "#ec4899", "#06b6d4", "#f97316", "#64748b"
  ];

  if (orgResolve.isLoading) {
    return (
      <div className="page-shell">
        <LoadingState rows={5} />
      </div>
    );
  }

  if (orgResolve.isError || !organizationId) {
    return (
      <div className="page-shell">
        <Alert tone="error">Could not load organization context.</Alert>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href={`/organizations/${slug}/projects`}>
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />} />
          </Link>
          <div>
            <h1 className="page-title">Create Project</h1>
            <p className="page-description">Launch a new initiative for your organization.</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "680px", margin: "0 auto", width: "100%" }}>
        <form onSubmit={handleSubmit}>
          <Card>
            <div className="stack" style={{ gap: "24px" }}>
              <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
                  <FormField label="Project Name" required>
                    <Input
                      placeholder="e.g. Website Redesign"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </FormField>

                  <FormField label="Description">
                    <textarea
                      className="input"
                      style={{ height: "100px", padding: "10px", resize: "vertical" }}
                      placeholder="What is this project about?"
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
                <FormField label="Project Type">
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as ProjectType })}
                    options={[
                      { label: "Basic List", value: "BASIC" },
                      { label: "Kanban Board", value: "KANBAN" },
                      { label: "Scrum / Sprints", value: "SCRUM" },
                    ]}
                  />
                </FormField>

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



              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid var(--border)", paddingTop: "24px", marginTop: "8px" }}>
                <Link href={`/organizations/${slug}/projects`}>
                  <Button variant="ghost" type="button">Cancel</Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || !formData.name}
                  icon={createMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <FolderKanban size={18} />}
                >
                  Create Project
                </Button>
              </div>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}
