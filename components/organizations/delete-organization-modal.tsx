"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";
import { useDeleteOrganizationMutation } from "@/lib/query/organization-hooks";
import { ApiClientError } from "@/lib/api/error";
import { useRouter } from "next/navigation";

type Props = {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  organizationSlug: string;
};

export function DeleteOrganizationModal({ open, onClose, organizationId, organizationSlug }: Props) {
  const { push } = useToast();
  const router = useRouter();
  const deleteMutation = useDeleteOrganizationMutation();

  const [confirmationInput, setConfirmationInput] = useState("");

  const confirmationPhrase = `DELETE/${organizationSlug}`;
  const isMatch = confirmationInput === confirmationPhrase;

  const handleDelete = async () => {
    if (!isMatch) {
      push({ title: "Deletion failed", description: `Please type "${confirmationPhrase}" to confirm.`, kind: "error" });
      return;
    }

    try {
      await deleteMutation.mutateAsync({ 
        organizationId, 
        confirmation: confirmationInput 
      });
      
      push({ title: "Organization deleted successfully.", kind: "success" });
      onClose();
      
      // Navigate away
      router.push("/organizations");
      router.refresh();
    } catch (err) {
      push({ 
        title: "Deletion failed", 
        description: err instanceof ApiClientError ? err.message : "An unexpected error occurred during deletion.", 
        kind: "error" 
      });
    }
  };

  return (
    <ConfirmDialog
      open={open}
      title="Delete Organization"
      description="You are about to permanently delete this organization and all associated data."
      onConfirm={handleDelete}
      onCancel={onClose}
      confirmLabel="Delete Permanently"
      loading={deleteMutation.isPending}
      tone="danger"
      confirmDisabled={!isMatch || deleteMutation.isPending}
    >
      <div className="form-grid">
        
        <div style={{ padding: "12px", background: "var(--danger-soft)", borderRadius: "var(--radius)", border: "1px solid var(--danger-border)" }}>
          <p style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--danger-text)", marginBottom: "4px" }}>
            This action is irreversible!
          </p>
          <p style={{ fontSize: "12.5px", color: "var(--danger-text)", opacity: 0.9 }}>
            All projects, members, and data associated with this organization will be permanently removed.
            Members will receive an email notification about the deletion.
          </p>
        </div>

        <FormField 
          label={
            <span style={{ fontSize: '13px' }}>
              Type <strong style={{ color: 'var(--danger-text)' }}>{confirmationPhrase}</strong> to confirm
            </span>
          } 
          htmlFor="confirmation"
        >
          <Input
            id="confirmation"
            value={confirmationInput}
            onChange={(e) => setConfirmationInput(e.target.value)}
            placeholder={confirmationPhrase}
            autoComplete="off"
            disabled={deleteMutation.isPending}
            className={confirmationInput && !isMatch ? "input-error" : ""}
          />
        </FormField>

        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
          The "Delete Permanently" button will be enabled once the phrase matches exactly.
        </p>
      </div>
      
      {/* Small CSS hack because ConfirmDialog uses its own button for confirmation, 
          we need to ensure it's disabled if !isMatch. 
          Actually, I can't easily disable that button from here without changing ConfirmDialog,
          but I can check isMatch inside handleDelete.
          Wait, I should probably update ConfirmDialog to allow disabling the confirm button.
      */}
    </ConfirmDialog>
  );
}
