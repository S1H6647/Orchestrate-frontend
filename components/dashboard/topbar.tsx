"use client";

import { usePathname, useParams } from "next/navigation";
import { Bell } from "lucide-react";

function useBreadcrumbs() {
  const pathname = usePathname();
  const params = useParams<{ slug?: string }>();

  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href?: string }[] = [];

  const orgSlug = params.slug;

  if (segments[0] === "organizations") {
    crumbs.push({ label: "Organizations", href: "/organizations" });

    if (orgSlug) {
      crumbs.push({ label: orgSlug, href: `/organizations/${orgSlug}` });

      const rest = segments.slice(2); // after [slug]
      if (rest[0] === "settings")    crumbs.push({ label: "Settings" });
      if (rest[0] === "members")     crumbs.push({ label: "Members" });
      if (rest[0] === "invitations") crumbs.push({ label: "Invitations" });
      if (rest[0] === "projects") {
        crumbs.push({ label: "Projects", href: `/organizations/${orgSlug}/projects` });
        if (rest[1] === "new") {
          crumbs.push({ label: "New Project" });
        } else if (rest[1]) {
          // rest[1] is [projectSlug]
          const projectSlug = rest[1];
          crumbs.push({ label: projectSlug, href: `/organizations/${orgSlug}/projects/${projectSlug}` });
          if (rest[2] === "members")  crumbs.push({ label: "Members" });
          if (rest[2] === "settings") crumbs.push({ label: "Settings" });
        }
      }
    } else if (segments[1] === "new") {
      crumbs.push({ label: "New" });
    }
  }

  return crumbs;
}

export function Topbar() {
  const crumbs = useBreadcrumbs();

  return (
    <header className="topbar">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        {crumbs.map((crumb, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {i > 0 && <span className="breadcrumb-sep">/</span>}
            {i === crumbs.length - 1 ? (
              <span className="breadcrumb-current">{crumb.label}</span>
            ) : (
              <a href={crumb.href} style={{ color: "var(--text-muted)" }}>
                {crumb.label}
              </a>
            )}
          </span>
        ))}
      </nav>

      <div className="topbar-right">
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={20} />
        </button>
      </div>
    </header>
  );
}
