"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, useEffect } from "react";
import { Save, Trash2, Lock, Globe, FileText, Fingerprint, Camera, Building2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { FilePicker } from "@/components/ui/file-picker";
import { LoadingState } from "@/components/ui/loading-state";
import { useToast } from "@/components/ui/toast";
import { ApiClientError } from "@/lib/api/error";
import { TransferOwnershipModal } from "@/components/organizations/transfer-ownership-modal";
import { DeleteOrganizationModal } from "@/components/organizations/delete-organization-modal";
import {
  useOrganizationBySlug,
  useOrganizationQuery,
  useUpdateOrganizationProfileMutation,
  useUpdateOrganizationIdentityMutation,
  useOrganizationMembersQuery,
} from "@/lib/query/organization-hooks";
import { useMeQuery } from "@/lib/query/auth-hooks";
import { orgSchema } from "@/lib/validation";
import { getOrgPermissions } from "@/lib/permissions/org-permissions";

export default function OrganizationSettingsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const { push } = useToast();

  const resolveQuery = useOrganizationBySlug(slug);
  const organizationId = resolveQuery.data?.id;

  const organizationQuery = useOrganizationQuery(organizationId as string);
  const meQuery = useMeQuery();
  const membersQuery = useOrganizationMembersQuery(organizationId as string);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmTransfer, setConfirmTransfer] = useState(false);

  const myRole = useMemo(() => {
    const meEmail = meQuery.data?.email;
    if (!meEmail || !membersQuery.data) return null;
    return membersQuery.data.content.find((member) => member.user.email === meEmail)?.role ?? null;
  }, [membersQuery.data, meQuery.data?.email]);

  const perms = getOrgPermissions(myRole);
  const isLoading = resolveQuery.isLoading || (!!organizationId && (organizationQuery.isLoading || membersQuery.isLoading));
  const isError = resolveQuery.isError || (!resolveQuery.isLoading && !organizationId) || organizationQuery.isError;

  useEffect(() => {
    if (!isLoading && !perms.canManageOrganizationSettings) {
      router.replace(`/organizations/${slug}`);
    }
  }, [isLoading, perms.canManageOrganizationSettings, router, slug]);

  if (isLoading) {
    return (
      <div className="page-shell">
        <LoadingState rows={6} />
      </div>
    );
  }

  if (isError || !organizationQuery.data) {
    return (
      <div className="page-shell">
        <Alert tone="error">Unable to load organization settings.</Alert>
      </div>
    );
  }

  const data = organizationQuery.data;
  const isOwner = myRole === "OWNER";
  const isAdmin = myRole === "ADMIN";
  const canEditProfile = isOwner || isAdmin;

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-description">Manage your organization profile and identity.</p>
        </div>
      </div>

      <div className="form-grid" style={{ gap: "32px" }}>
        {/* Profile Settings */}
        {canEditProfile ? (
          <ProfileSection organizationId={organizationId!} initialData={data} />
        ) : (
          <Card>
            <div className="card-header">
              <div>
                <div className="card-title">Profile Settings</div>
                <div className="card-desc">You do not have permission to edit this organization's profile.</div>
              </div>
            </div>
          </Card>
        )}

        {/* Identity Settings */}
        {isOwner ? (
          <IdentitySection organizationId={organizationId!} initialData={data} />
        ) : (
          <Card>
            <div className="card-header">
              <div className="row" style={{ gap: "8px" }}>
                <Lock size={16} className="text-muted" />
                <div>
                  <div className="card-title">Identity Settings</div>
                  <div className="card-desc">Only the organization owner can change identity settings.</div>
                </div>
              </div>
            </div>
            <div className="form-grid" style={{ opacity: 0.6, pointerEvents: "none" }}>
              <FormField label="Organization Name">
                <Input value={data.name} readOnly />
              </FormField>
              <FormField label="Slug">
                <Input value={data.slug} readOnly />
              </FormField>
            </div>
          </Card>
        )}

        {/* Danger Zone */}
        {isOwner && (
          <Card padding="0">
            <div className="card-header" style={{ padding: "20px 22px 14px" }}>
              <div>
                <div className="card-title" style={{ color: "var(--danger)" }}>Danger Zone</div>
                <div className="card-desc">Irreversible actions — proceed with caution.</div>
              </div>
            </div>
            
            <div className="form-grid" style={{ gap: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  padding: "18px 22px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>Transfer Ownership</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                    Transfer this organization to another member. You will lose owner access.
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setConfirmTransfer(true)}
                >
                  Transfer
                </Button>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  padding: "18px 22px",
                  background: "var(--danger-soft)",
                  borderBottomLeftRadius: "var(--radius)",
                  borderBottomRightRadius: "var(--radius)",
                }}
              >
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--danger-text)" }}>Delete this organization</div>
                  <div style={{ fontSize: 12.5, color: "var(--danger-text)", opacity: 0.75 }}>
                    Once deleted, this organization and all its data will be permanently removed.
                  </div>
                </div>
                <Button
                  variant="danger"
                  icon={<Trash2 size={14} />}
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete Organization
                </Button>
              </div>
            </div>
          </Card>
        )}

        {(isOwner || isAdmin) && (
          <Card>
            <div className="card-header">
              <div>
                <div className="card-title">Invitations</div>
                <div className="card-desc">Manage organization invitation links and pending recipients.</div>
              </div>
            </div>
            <div className="row" style={{ justifyContent: "flex-end" }}>
              <Button variant="outline" onClick={() => router.push(`/organizations/${slug}/invitations`)}>
                Open Invitations
              </Button>
            </div>
          </Card>
        )}
      </div>

      <TransferOwnershipModal
        open={confirmTransfer}
        onClose={() => setConfirmTransfer(false)}
        organizationId={organizationId!}
      />

      <DeleteOrganizationModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        organizationId={organizationId!}
        organizationSlug={data.slug}
      />
    </div>
  );
}

function ProfileSection({ organizationId, initialData }: { organizationId: string; initialData: any }) {
  const { push } = useToast();
  const mutation = useUpdateOrganizationProfileMutation(organizationId);
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState(initialData.description || "");
  const [websiteUrl, setWebsiteUrl] = useState(initialData.websiteUrl || "");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setDescription(initialData.description || "");
    setWebsiteUrl(initialData.websiteUrl || "");
  }, [initialData.description, initialData.websiteUrl]);

  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [image]);

  const isDirty = 
    description !== (initialData.description || "") || 
    websiteUrl !== (initialData.websiteUrl || "") || 
    image !== null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const parsed = orgSchema.pick({ description: true, websiteUrl: true }).safeParse({ description, websiteUrl });
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
        payload: {
          description: description || undefined,
          websiteUrl: websiteUrl || undefined,
        },
        image
      });
      push({ title: "Profile updated", kind: "success" });
      setImage(null);
    } catch (error) {
      if (error instanceof ApiClientError) {
        setFieldErrors(error.details ?? {});
        push({ title: "Update failed", description: error.message, kind: "error" });
      } else {
        push({ title: "Update failed", description: "Profile update failed.", kind: "error" });
      }
    }
  }

  const activeLogoUrl = previewUrl || initialData.logoUrl;

  return (
    <Card>
      <div className="card-header">
        <div className="row" style={{ gap: "8px" }}>
          <FileText size={18} className="text-primary" />
          <div>
            <div className="card-title">Profile Settings</div>
            <div className="card-desc">Visible to all members of the organization.</div>
          </div>
        </div>
      </div>
      <form className="form-grid" onSubmit={onSubmit} style={{ gap: "28px" }}>

        {/* Improved Logo Section */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "24px", 
          paddingBottom: "16px",
          borderBottom: "1px solid var(--border-soft)",
          flexDirection: "row",
          flexWrap: "wrap"
        }}>
          <div style={{ position: "relative" }}>
            <div style={{ 
              width: 120, 
              height: 120, 
              borderRadius: "16px", 
              background: "var(--background-alt)",
              border: "2px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              boxShadow: "var(--shadow-sm)",
              transition: "border-color 0.2s ease"
            }}>
              {activeLogoUrl ? (
                <img 
                  src={activeLogoUrl} 
                  alt="Org Logo" 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                />
              ) : (
                <div style={{ color: "var(--text-muted-more)" }}><Building2 size={40} /></div>
              )}
            </div>
            {image && (
              <div style={{ 
                position: "absolute", 
                top: -8, 
                right: -8, 
                background: "var(--primary)", 
                color: "white", 
                borderRadius: "50%", 
                padding: "4px",
                display: "flex",
                boxShadow: "var(--shadow-md)"
              }}>
                <Camera size={12} />
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: "240px" }}>
            <div style={{ marginBottom: "12px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>Organization Logo</h4>
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                This is your organization&apos;s visual identity. We recommend a square image of at least 256x256px.
              </p>
            </div>
            <FilePicker
              id="image"
              value={image}
              onChange={setImage}
              placeholder="Change logo"
              className="compact"
            />
          </div>
        </div>

        <div className="form-grid" style={{ gap: "20px" }}>
          <FormField label="Description" htmlFor="description" error={fieldErrors.description}>
            <textarea 
              id="description" 
              className="input" 
              style={{ height: "auto", minHeight: 100, fontSize: "14px", paddingTop: "10px", paddingBottom: "10px" }} 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about your organization's mission and goals..."
            />
          </FormField>

          <FormField label="Website URL" htmlFor="website" error={fieldErrors.websiteUrl}>
            <div className="input-wrapper" style={{ display: "flex", alignItems: "center", position: "relative" }}>
               <div style={{ position: "absolute", left: 12, color: "var(--text-muted)", display: "flex", pointerEvents: "none" }}><Globe size={14} /></div>
               <input
                  id="website"
                  className={fieldErrors.websiteUrl ? "input input-error" : "input"}
                  style={{ paddingLeft: 34, fontSize: "14px" }}
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://orchestrate.io"
                />
            </div>
          </FormField>
        </div>

        <div className="row" style={{ justifyContent: "flex-end", marginTop: 8 }}>
          <Button type="submit" loading={mutation.isPending} disabled={!isDirty} icon={<Save size={14} />}>
            Save Profile
          </Button>
        </div>
      </form>
    </Card>
  );
}

function IdentitySection({ organizationId, initialData }: { organizationId: string; initialData: any }) {
  const { push } = useToast();
  const mutation = useUpdateOrganizationIdentityMutation(organizationId);
  const [name, setName] = useState(initialData.name || "");
  const [slug, setSlug] = useState(initialData.slug || "");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setName(initialData.name || "");
    setSlug(initialData.slug || "");
  }, [initialData.name, initialData.slug]);

  const isDirty = 
    name !== (initialData.name || "") || 
    slug !== (initialData.slug || "");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const parsed = orgSchema.pick({ name: true, slug: true }).safeParse({ name, slug });
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
      await mutation.mutateAsync({ name, slug });
      push({ title: "Identity updated", kind: "success" });
      
      if (slug !== initialData.slug) {
        window.location.href = `/organizations/${slug}/settings`;
      }
    } catch (error) {
      if (error instanceof ApiClientError) {
        if (error.status === 403) {
           push({ title: "Permission denied", description: "You do not have permission to change these settings.", kind: "error" });
        } else if (error.status === 409 || (error.message && error.message.toLowerCase().includes("slug"))) {
           setFieldErrors({ slug: "This slug is already in use by another organization." });
           push({ title: "Identity update failed", description: "This slug is already in use.", kind: "error" });
        } else {
           setFieldErrors(error.details ?? {});
           push({ title: "Identity update failed", description: error.message, kind: "error" });
        }
      } else {
        push({ title: "Identity update failed", description: "Update failed.", kind: "error" });
      }
    }
  }

  return (
    <Card>
      <div className="card-header">
        <div className="row" style={{ gap: "8px" }}>
          <Fingerprint size={18} className="text-primary" />
          <div>
            <div className="card-title">Identity Settings</div>
            <div className="card-desc">Core identifiers for your organization. Only visible to owners.</div>
          </div>
        </div>
      </div>
      <form className="form-grid" onSubmit={onSubmit} style={{ gap: "20px" }}>

        <FormField label="Organization Name" htmlFor="name" error={fieldErrors.name}>
          <Input 
            id="name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={fieldErrors.name} 
            style={{ fontSize: "14px" }}
          />
        </FormField>

        <FormField 
          label="Slug" 
          htmlFor="slug" 
          error={fieldErrors.slug}
          hint="lowercase letters, numbers, hyphens only."
        >
          <Input 
            id="slug" 
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            error={fieldErrors.slug}
            placeholder="my-org-01" 
            style={{ fontSize: "14px" }}
          />
        </FormField>

        <div className="row" style={{ justifyContent: "flex-end", marginTop: 8 }}>
          <Button type="submit" loading={mutation.isPending} disabled={!isDirty} icon={<Save size={14} />}>
            Save Identity
          </Button>
        </div>
      </form>
    </Card>
  );
}
