"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  tone?: "danger" | "primary";
  children?: ReactNode;
  confirmDisabled?: boolean;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading,
  tone = "danger",
  children,
  confirmDisabled,
}: Props) {
  if (!open) {
    return null;
  }
  return (
    <div
      className="dialog-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="dialog">
        <div className="dialog-header">
          <div className="row" style={{ gap: "10px", alignItems: "flex-start" }}>
            {tone === "danger" && (
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "var(--danger-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--danger)",
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={16} />
              </div>
            )}
            <div>
              <h3 id="dialog-title" className="dialog-title">{title}</h3>
              <p className="dialog-desc">{description}</p>
            </div>
          </div>
        </div>
        {children && <div className="dialog-body">{children}</div>}
        <div className="dialog-footer">
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button 
            variant={tone === "danger" ? "danger" : "primary"} 
            onClick={onConfirm} 
            loading={loading}
            disabled={confirmDisabled}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
