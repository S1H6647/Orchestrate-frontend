"use client";

import { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

const icons = {
  info: <Info size={15} />,
  error: <AlertCircle size={15} />,
  success: <CheckCircle2 size={15} />,
};

type Props = {
  children: ReactNode;
  tone?: "info" | "error" | "success";
};

export function Alert({ children, tone = "info" }: Props) {
  return (
    <div className={`alert alert-${tone}`}>
      <span style={{ flexShrink: 0, marginTop: "1px" }}>{icons[tone]}</span>
      <span>{children}</span>
    </div>
  );
}
