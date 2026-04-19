"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { ApiClientError } from "@/lib/api/error";
import { useCreateProjectMutation } from "@/lib/query/project-hooks";
import { useOrganizationBySlug } from "@/lib/query/organization-hooks";
import { projectSchema } from "@/lib/validation";

export default function NewProjectPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const { push } = useToast();

  const resolveQuery = useOrganizationBySlug(slug);
  const organizationId = resolveQuery.data?.id;

  const mutation = useCreateProjectMutation(organizationId as string);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#216cce");
  const [type, setType] = useState<"BASIC" | "KANBAN" | "SCRUM">("BASIC");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");
  const [startDate, setStartDate] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  if (resolveQuery.isLoading) {
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

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    const parsed = projectSchema.safeParse({
      name,
      description,
      color,
      type,
      visibility,
      startDate,
      targetDate,
    });

    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (typeof key === "string") {
          nextErrors[key] = issue.message;
        }
      });
      setFieldErrors(nextErrors);
      return;
    }

    try {
      await mutation.mutateAsync({
        name: parsed.data.name,
        description: parsed.data.description || undefined,
        color: parsed.data.color || undefined,
        type: parsed.data.type,
        visibility: parsed.data.visibility,
        startDate: parsed.data.startDate || undefined,
        targetDate: parsed.data.targetDate || undefined,
      });
      push({ title: "Project created", kind: "success" });
      router.replace(`/organizations/${slug}/projects`);
    } catch (error) {
      if (error instanceof ApiClientError) {
        setGeneralError(error.message);
        setFieldErrors(error.details ?? {});
      } else {
        setGeneralError("Could not create project.");
      }
    }
  }

  return (
    <div className="page-shell">
      <Card>
        <h1>Create project</h1>
        <p>Configure project type, visibility, and dates.</p>
      </Card>

      <Card>
        <form className="form-grid" onSubmit={onSubmit} noValidate>
          {generalError ? <Alert tone="error">{generalError}</Alert> : null}

          <div className="form-grid two">
            <FormField label="Name" htmlFor="name" error={fieldErrors.name}>
              <Input id="name" value={name} onChange={(event) => setName(event.target.value)} error={fieldErrors.name} placeholder="Project Alpha" />
            </FormField>
            <FormField label="Theme Color" htmlFor="color" error={fieldErrors.color}>
              <div className="row" style={{ gap: "10px" }}>
                <input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                  style={{
                    width: "42px",
                    height: "42px",
                    padding: "0",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    cursor: "pointer",
                    background: "none"
                  }}
                />
                <Input
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                  placeholder="#000000"
                  style={{ flex: 1 }}
                />
              </div>
            </FormField>
          </div>

          <FormField label="Description" htmlFor="description" error={fieldErrors.description}>
            <textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} />
          </FormField>

          <div className="form-grid two">
            <FormField label="Type" htmlFor="type">
              <Select id="type" value={type} onChange={(event) => setType(event.target.value as "BASIC" | "KANBAN" | "SCRUM") }>
                <option value="BASIC">BASIC</option>
                <option value="KANBAN">KANBAN</option>
                <option value="SCRUM">SCRUM</option>
              </Select>
            </FormField>

            <FormField label="Visibility" htmlFor="visibility">
              <Select
                id="visibility"
                value={visibility}
                onChange={(event) => setVisibility(event.target.value as "PUBLIC" | "PRIVATE")}
              >
                <option value="PUBLIC">PUBLIC</option>
                <option value="PRIVATE">PRIVATE</option>
              </Select>
            </FormField>
          </div>

          <div className="form-grid two">
            <FormField label="Start date" htmlFor="startDate">
              <Input id="startDate" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </FormField>
            <FormField label="Target date" htmlFor="targetDate">
              <Input id="targetDate" type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} />
            </FormField>
          </div>

          <Button type="submit" loading={mutation.isPending}>
            Create project
          </Button>
        </form>
      </Card>
    </div>
  );
}
