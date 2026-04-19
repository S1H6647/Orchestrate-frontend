"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Plus } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { FilePicker } from "@/components/ui/file-picker";
import { useToast } from "@/components/ui/toast";
import { ApiClientError } from "@/lib/api/error";
import { useCreateOrganizationMutation } from "@/lib/query/organization-hooks";
import { orgSchema } from "@/lib/validation";

export default function NewOrganizationPage() {
  const router = useRouter();
  const { push } = useToast();
  const mutation = useCreateOrganizationMutation();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    const parsed = orgSchema.safeParse({ name, slug, description, websiteUrl });
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
      const payload = {
        name: parsed.data.name,
        slug: parsed.data.slug || undefined,
        description: parsed.data.description || undefined,
        websiteUrl: parsed.data.websiteUrl || undefined,
      };
      const result = await mutation.mutateAsync({ payload, image });
      push({ title: "Organization created", kind: "success" });
      router.replace(`/organizations/${result.slug}`);
    } catch (error) {
      if (error instanceof ApiClientError) {
        setGeneralError(error.message);
        setFieldErrors(error.details ?? {});
      } else {
        setGeneralError("Could not create organization.");
      }
    }
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">New Organization</h1>
          <p className="page-description">Provision a new workspace with branding and profile links.</p>
        </div>
      </div>

      <Card>
        <div className="card-header">
          <div>
            <div className="card-title">Organization Details</div>
            <div className="card-desc">This information will be visible to all members.</div>
          </div>
        </div>
        <form className="form-grid" onSubmit={onSubmit} noValidate>
          {generalError ? <Alert tone="error">{generalError}</Alert> : null}

          <div className="form-grid two">
            <FormField label="Name" htmlFor="name" error={fieldErrors.name}>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                error={fieldErrors.name}
                placeholder="Acme Corp"
              />
            </FormField>
            <FormField label="Slug" htmlFor="slug" error={fieldErrors.slug} hint="lowercase-hyphen format">
              <Input
                id="slug"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                error={fieldErrors.slug}
                placeholder="acme-corp"
              />
            </FormField>
          </div>

          <FormField label="Description" htmlFor="description" error={fieldErrors.description}>
            <textarea
              id="description"
              className="input"
              style={{ height: "auto", minHeight: 80 }}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="A brief description of your organization…"
            />
          </FormField>

          <div className="form-grid">
            <FormField label="Website URL" htmlFor="websiteUrl" error={fieldErrors.websiteUrl}>
              <Input
                id="websiteUrl"
                value={websiteUrl}
                onChange={(event) => setWebsiteUrl(event.target.value)}
                error={fieldErrors.websiteUrl}
                placeholder="https://example.com"
              />
            </FormField>
          </div>

          <FormField label="Logo image" htmlFor="image">
            <FilePicker
              id="image"
              value={image}
              onChange={setImage}
              placeholder="Upload organization logo"
            />
          </FormField>

          <div className="row" style={{ justifyContent: "flex-end" }}>
            <Button type="submit" loading={mutation.isPending} icon={<Plus size={14} />}>
              Create Organization
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
