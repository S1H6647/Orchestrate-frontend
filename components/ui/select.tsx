import { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: string;
};

export function Select({ className, error, children, ...props }: Props) {
  return (
    <select className={cn("select", error && "input-error", className)} {...props}>
      {children}
    </select>
  );
}
