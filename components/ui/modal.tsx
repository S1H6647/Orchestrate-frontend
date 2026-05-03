"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
};

export function Modal({ open, onClose, title, children, className, size = "md" }: Props) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div 
      className="dialog-overlay" 
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ zIndex: 1000 }}
    >
      <div className={cn("dialog", size !== "md" && `dialog-${size}`, className)}>
        <div className="dialog-header">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            {title && <h3 className="dialog-title">{title}</h3>}
            <button 
              onClick={onClose}
              style={{ 
                background: "transparent", 
                border: "none", 
                cursor: "pointer", 
                color: "var(--text-muted)",
                padding: "4px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "var(--surface-hover)"}
              onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="dialog-body" style={{ padding: "24px 32px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
