import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  padding?: string;
};

export function Card({ children, className, padding }: Props) {
  return (
    <section
      className={cn("card", className)}
      style={padding !== undefined ? { padding } : undefined}
    >
      {children}
    </section>
  );
}
