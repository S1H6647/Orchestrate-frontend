"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  PlusCircle,
  Settings,
  Users,
  Mail,
  FolderKanban,
  FolderPlus,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useLogoutMutation, useMeQuery } from "@/lib/query/auth-hooks";
import { useMyOrganizationsQuery } from "@/lib/query/organization-hooks";
import { getOrgPermissions } from "@/lib/permissions/org-permissions";
import type { OrganizationRole, OrganizationSummary } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "orchestrate:sidebar-collapsed";

function getInitialCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

function getInitials(name?: string | null): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  collapsed: boolean;
}

function NavItem({ href, icon, label, isActive, collapsed }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn("nav-item", isActive && "active")}
      title={collapsed ? label : undefined}
    >
      <span className="nav-icon">{icon}</span>
      <span className="nav-label">{label}</span>
    </Link>
  );
}

interface SidebarSectionProps {
  label: string;
  collapsed: boolean;
  items: NavItemProps[];
}

function SidebarSection({ label, collapsed, items }: SidebarSectionProps) {
  return (
    <>
      <div className="sidebar-section-label">{label}</div>
      {items.map((item) => (
        <NavItem key={item.href} {...item} collapsed={collapsed} />
      ))}
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const params = useParams<{ slug?: string }>();
  const meQuery = useMeQuery();
  const logoutMutation = useLogoutMutation();
  const organizationsQuery = useMyOrganizationsQuery();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(getInitialCollapsed());
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      window.dispatchEvent(new Event("sidebar-toggle"));
      return next;
    });
  }, []);

  const orgSlug = params.slug;
  const user = meQuery.data;
  const organizations = (organizationsQuery.data ?? []).filter((organization) => {
    const membershipStatus = organization.membershipStatus?.toUpperCase();
    return !membershipStatus || membershipStatus === "ACTIVE";
  });

  const [expandedOrgs, setExpandedOrgs] = useState<Record<string, boolean>>({});

  // Ensure active org is expanded by default
  useEffect(() => {
    if (orgSlug) {
      setExpandedOrgs((prev) => ({ ...prev, [orgSlug]: true }));
    }
  }, [orgSlug]);

  const handleOrgClick = (e: React.MouseEvent, slug: string) => {
    if (slug === orgSlug) {
      // If we're already on this org, toggle its expansion
      e.preventDefault();
      setExpandedOrgs((prev) => ({ ...prev, [slug]: !prev[slug] }));
    }
  };

  const globalItems: NavItemProps[] = [
    {
      href: "/organizations",
      icon: <LayoutDashboard size={18} />,
      label: "Organizations",
      isActive: pathname === "/organizations",
      collapsed,
    },
    {
      href: "/organizations/new",
      icon: <PlusCircle size={18} />,
      label: "New Organization",
      isActive: pathname === "/organizations/new",
      collapsed,
    },
    {
      href: "/invitations",
      icon: <Mail size={18} />,
      label: "My Invitations",
      isActive: pathname === "/invitations" || pathname.startsWith("/invitations/"),
      collapsed,
    },
  ];

  const getOrgSubItems = (slug: string, role?: OrganizationRole): NavItemProps[] => {
    const perms = getOrgPermissions(role);
    const items: NavItemProps[] = [];

    if (perms.canViewOverview) {
      items.push({
        href: `/organizations/${slug}`,
        icon: <Building2 size={16} />,
        label: "Overview",
        isActive: pathname === `/organizations/${slug}`,
        collapsed,
      });
    }

    if (perms.canManageOrganizationSettings) {
      items.push({
        href: `/organizations/${slug}/settings`,
        icon: <Settings size={16} />,
        label: "Settings",
        isActive: pathname === `/organizations/${slug}/settings`,
        collapsed,
      });
    }

    if (perms.canViewMembers) {
      items.push({
        href: `/organizations/${slug}/members`,
        icon: <Users size={16} />,
        label: "Members",
        isActive: pathname === `/organizations/${slug}/members`,
        collapsed,
      });
    }

    if (perms.canManageInvitations) {
      items.push({
        href: `/organizations/${slug}/invitations`,
        icon: <Mail size={16} />,
        label: "Invitations",
        isActive: pathname === `/organizations/${slug}/invitations`,
        collapsed,
      });
    }

    if (perms.canViewProjects) {
      items.push({
        href: `/organizations/${slug}/projects`,
        icon: <FolderKanban size={16} />,
        label: "Projects",
        isActive: pathname === `/organizations/${slug}/projects`,
        collapsed,
      });
    }

    if (perms.canCreateProject) {
      items.push({
        href: `/organizations/${slug}/projects/new`,
        icon: <FolderPlus size={16} />,
        label: "New Project",
        isActive: pathname === `/organizations/${slug}/projects/new`,
        collapsed,
      });
    }

    return items;
  };

  return (
    <aside className={cn("sidebar", collapsed && "collapsed")}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">O</div>
        <span className="sidebar-brand">Orchestrate</span>
        <button
          className="sidebar-toggle"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Nav body */}
      <div className="sidebar-body">
        <SidebarSection label="General" collapsed={collapsed} items={globalItems} />

        {organizations.length > 0 && (
          <>
            <div className="divider" style={{ marginTop: "10px", marginBottom: "4px" }} />
            <div className="sidebar-section-label">My Organizations</div>
            {organizations.map((org: OrganizationSummary) => {
              const isActiveOrg = org.slug === orgSlug;
              const isExpanded = expandedOrgs[org.slug] && isActiveOrg; 
              // We only render children for the active org currently, but keep state per org.
              // So if they click it, it toggles.

              return (
                <div key={org.id} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <Link
                    href={`/organizations/${org.slug}`}
                    className={cn("nav-item", isActiveOrg && "active")}
                    title={collapsed ? org.name : undefined}
                    onClick={(e) => handleOrgClick(e, org.slug)}
                  >
                    {/* Tiny avatar for org */}
                    <span 
                      className="nav-icon"
                      style={{
                        width: 18, 
                        height: 18, 
                        borderRadius: 4, 
                        background: "var(--primary-soft)", 
                        color: "var(--primary)",
                        fontSize: 10,
                        fontWeight: 800,
                      }}
                    >
                      {org.name[0].toUpperCase()}
                    </span>
                    <span className="nav-label">{org.name}</span>
                  </Link>

                  {/* Render nested sub items in an animated wrapper */}
                  <div
                    className={cn("sidebar-subnav", isExpanded && !collapsed && "expanded")}
                  >
                    <div className="sidebar-subnav-inner">
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginLeft: "12px", borderLeft: "1px solid var(--sidebar-border)", paddingLeft: "10px", marginTop: "4px", marginBottom: "8px" }}>
                        {getOrgSubItems(org.slug, org.myRole).map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn("nav-item", subItem.isActive && "active")}
                            style={{ padding: "6px 8px", fontSize: "12.5px" }}
                          >
                            <span className="nav-icon" style={{ opacity: 0.7 }}>{subItem.icon}</span>
                            <span className="nav-label">{subItem.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Footer – User section */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{getInitials(user?.name)}</div>
          <div className="user-info">
            <div className="user-name">{user?.name ?? "User"}</div>
            <div className="user-email">{user?.email ?? ""}</div>
          </div>
          {!collapsed && (
            <button
              className="logout-btn"
              title="Log out"
              disabled={logoutMutation.isPending}
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  await logoutMutation.mutateAsync();
                } catch (err) {
                  console.error("Logout API failed", err);
                } finally {
                  window.location.href = "/login";
                }
              }}
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
