"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";
import { useOrganizationMembersQuery, useTransferOwnershipMutation } from "@/lib/query/organization-hooks";
import { useMeQuery } from "@/lib/query/auth-hooks";
import { ApiClientError } from "@/lib/api/error";

type Props = {
  open: boolean;
  onClose: () => void;
  organizationId: string;
};

export function TransferOwnershipModal({ open, onClose, organizationId }: Props) {
  const { push } = useToast();
  const { data: me } = useMeQuery();
  const { data: members, isLoading } = useOrganizationMembersQuery(organizationId);
  const transferMutation = useTransferOwnershipMutation(organizationId);

  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTransfer = async () => {
    if (!selectedMemberId) {
      setError("Please select a member to transfer ownership to.");
      return;
    }
    if (!isConfirmed) {
      setError("You must confirm that you understand the implications.");
      return;
    }

    try {
      setError(null);
      await transferMutation.mutateAsync(selectedMemberId);
      push({ title: "Ownership transferred successfully.", kind: "success" });
      onClose();
      // Optionally refresh page or redirect
      window.location.reload();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
      push({ title: "Transfer failed", description: err instanceof Error ? err.message : "Unknown error", kind: "error" });
    }
  };

  const otherMembers = members?.filter((m) => m.role !== "OWNER" && m.user.id !== me?.id) || [];

  return (
    <ConfirmDialog
      open={open}
      title="Transfer Ownership"
      description="Transfer full control of this organization to another member."
      onConfirm={handleTransfer}
      onCancel={onClose}
      confirmLabel="Transfer Ownership"
      loading={transferMutation.isPending}
      tone="danger"
      confirmDisabled={!selectedMemberId || !isConfirmed || transferMutation.isPending}
    >
      <div className="form-grid">
        {error && <Alert tone="error">{error}</Alert>}
        
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "8px" }}>
          Transferring ownership will grant full administrator privileges to the selected member. 
          You will lose owner access and this action cannot be auto-reverted.
        </p>

        <FormField label="Select new owner" htmlFor="newOwner">
          <Select
            id="newOwner"
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            disabled={isLoading || transferMutation.isPending}
          >
            <option value="">Select a member...</option>
            {otherMembers.map((member) => (
              <option key={member.user.id} value={member.user.id}>
                {member.user.email} ({member.role})
              </option>
            ))}
          </Select>
        </FormField>

        <label 
          style={{ 
            display: "flex", 
            gap: "10px", 
            alignItems: "flex-start", 
            fontSize: "13px", 
            cursor: "pointer",
            marginTop: "8px",
            userSelect: "none"
          }}
        >
          <input
            type="checkbox"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
            style={{ marginTop: "3px" }}
          />
          <span>
            I understand this transfers ownership permanently and I will no longer be the owner of this organization.
          </span>
        </label>

        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px", fontStyle: "italic" }}>
          The new owner will be notified via email about this transfer.
        </p>
      </div>
    </ConfirmDialog>
  );
}
