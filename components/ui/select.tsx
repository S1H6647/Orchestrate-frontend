import { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: string;
  options?: { label: string; value: string | number }[];
};

export function Select({ className, error, options, children, ...props }: Props) {
  return (
    <select className={cn("select", error && "input-error", className)} {...props}>
      {options
        ? options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))
        : children}
    </select>
  );
}
