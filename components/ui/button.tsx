import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  tone?: "primary" | "danger";
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
};

export function Button({
  className,
  variant,
  tone,
  size = "md",
  loading,
  icon,
  children,
  disabled,
  ...props
}: Props) {
  const activeVariant = tone || variant || "primary";
  return (
    <button
      className={cn("btn", `btn-${activeVariant}`, size === "sm" && "btn-sm", size === "lg" && "btn-lg", className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} />
      ) : icon ? (
        icon
      ) : null}
      {loading ? "Please wait…" : children}
    </button>
  );
}
