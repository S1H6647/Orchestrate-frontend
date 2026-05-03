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
  footer?: ReactNode;
};

export function Drawer({ open, onClose, title, children, className, footer }: Props) {
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
      className="drawer-overlay" 
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={cn("drawer", className)}>
        <div className="drawer-header">
          {title ? <h3 className="page-title" style={{ fontSize: 18 }}>{title}</h3> : <div />}
          <button 
            onClick={onClose}
            style={{ 
              background: "transparent", 
              border: "none", 
              cursor: "pointer", 
              color: "var(--text-muted)",
              padding: "8px",
              borderRadius: "8px",
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
        <div className="drawer-body">
          {children}
        </div>
        {footer && (
          <div className="drawer-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
