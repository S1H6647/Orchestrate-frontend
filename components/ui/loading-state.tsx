import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState({ rows = 4 }: { rows?: number }) {
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton
          key={index}
          style={{ height: index === 0 ? "20px" : "14px", width: index % 2 === 0 ? "100%" : "70%" }}
        />
      ))}
    </div>
  );
}
