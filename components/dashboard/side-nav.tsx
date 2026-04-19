"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useLogoutMutation, useMeQuery } from "@/lib/query/auth-hooks";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SideNav() {
  const pathname = usePathname();
  const params = useParams<{ organizationId?: string }>();
  const meQuery = useMeQuery();
  const logoutMutation = useLogoutMutation();

  const orgId = params.organizationId;
  const organizationLinks = orgId
    ? [
        { href: `/organizations/${orgId}`, label: "Overview" },
        { href: `/organizations/${orgId}/settings`, label: "Settings" },
        { href: `/organizations/${orgId}/members`, label: "Members" },
        { href: `/organizations/${orgId}/invitations`, label: "Invitations" },
        { href: `/organizations/${orgId}/projects`, label: "Projects" },
        { href: `/organizations/${orgId}/projects/new`, label: "New Project" },
      ]
    : [];

  return (
    <aside className="sidebar">
      <div className="brand">Orchestrate</div>
      <div className="stack" style={{ marginBottom: "1rem" }}>
        <p style={{ fontWeight: 600 }}>{meQuery.data?.name ?? "User"}</p>
        <p>{meQuery.data?.email ?? ""}</p>
      </div>

      <nav className="nav-list" aria-label="Main navigation">
        <Link href="/organizations" className={cn("nav-link", pathname === "/organizations" && "active")}>
          Organizations
        </Link>
        <Link href="/organizations/new" className={cn("nav-link", pathname === "/organizations/new" && "active")}>
          New Organization
        </Link>
        {organizationLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn("nav-link", pathname === item.href && "active")}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div style={{ marginTop: "1rem" }}>
        <Button
          variant="ghost"
          loading={logoutMutation.isPending}
          onClick={async () => {
            try {
              await logoutMutation.mutateAsync();
            } catch (err) {
              console.error("Logout API failed", err);
            } finally {
              window.location.href = "/login";
            }
          }}
        >
          Logout
        </Button>
      </div>
    </aside>
  );
}
