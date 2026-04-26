import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  padding?: string;
  style?: React.CSSProperties;
};

export function Card({ children, className, padding, style }: Props) {
  const combinedStyle = {
    ...(padding !== undefined ? { padding } : {}),
    ...style,
  };

  return (
    <section className={cn("card", className)} style={combinedStyle}>
      {children}
    </section>
  );
}
