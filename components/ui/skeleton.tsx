import { CSSProperties } from "react";

export function Skeleton({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`skeleton ${className}`.trim()}
      style={{ height: "1rem", ...style }}
      aria-hidden="true"
    />
  );
}
