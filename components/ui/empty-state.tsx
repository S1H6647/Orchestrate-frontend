import Link from "next/link";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { InboxIcon } from "lucide-react";

type Props = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: ReactNode;
};

export function EmptyState({ title, description, actionHref, actionLabel, icon }: Props) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        {icon ?? <InboxIcon size={24} />}
      </div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-desc">{description}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} style={{ marginTop: "4px" }}>
          <Button>{actionLabel}</Button>
        </Link>
      ) : null}
    </div>
  );
}
