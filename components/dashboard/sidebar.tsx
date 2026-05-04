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
  ChevronDown,
  ChevronsUpDown,
  Plus,
  Folder,
  Kanban,
} from "lucide-react";
import { useLogoutMutation, useMeQuery } from "@/lib/query/auth-hooks";
import { useMyOrganizationsQuery, useOrganizationBySlug } from "@/lib/query/organization-hooks";
import { useProjectsQuery } from "@/lib/query/project-hooks";
import { getOrgPermissions } from "@/lib/permissions/org-permissions";
import type { OrganizationRole, OrganizationSummary, ProjectStatus } from "@/lib/api/types";
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
  href?: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  collapsed: boolean;
  onClick?: (e: React.MouseEvent) => void;
  isExpandable?: boolean;
  isExpanded?: boolean;
  isSubItem?: boolean;
}

function NavItem({ 
  href, 
  icon, 
  label, 
  isActive, 
  collapsed, 
  onClick, 
  isExpandable, 
  isExpanded,
  isSubItem 
}: NavItemProps) {
  const content = (
    <>
      <span className="nav-icon">{icon}</span>
      {!collapsed && <span className="nav-label">{label}</span>}
      {isExpandable && !collapsed && (
        <ChevronDown 
          size={14} 
          style={{ marginLeft: "auto", opacity: 0.5, transition: "transform 200ms", transform: isExpanded ? "rotate(180deg)" : "none" }} 
        />
      )}
    </>
  );

  const className = cn(
    "nav-item", 
    isActive && "active", 
    isSubItem && "sub-item",
    collapsed && "collapsed-item"
  );

  if (onClick && !href) {
    return (
      <button className={className} onClick={onClick} title={collapsed ? label : undefined}>
        {content}
      </button>
    );
  }

  return (
    <Link
      href={href || "#"}
      className={className}
      title={collapsed ? label : undefined}
      onClick={onClick}
    >
      {content}
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
  const [isOrgSwitcherOpen, setIsOrgSwitcherOpen] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});

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

  const toggleProject = (projectSlug: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectSlug]: !prev[projectSlug]
    }));
  };

  const orgSlug = params.slug;
  const user = meQuery.data;
  const isSystemAdmin = user?.systemRole === "SYSTEM_ADMIN";
  
  const orgResolve = useOrganizationBySlug(orgSlug);
  const activeOrg = orgResolve.data;
  const perms = getOrgPermissions(activeOrg?.myRole);
  
  const projectsQuery = useProjectsQuery(activeOrg?.id as string);
  const allProjects = projectsQuery.data ?? [];
  
  // Filter projects to show only PLANNING and ACTIVE by default
  const defaultStatuses: ProjectStatus[] = ["PLANNING", "ACTIVE"];
  const projects = allProjects.filter(p => defaultStatuses.includes(p.status));

  const organizations = (organizationsQuery.data ?? []).filter((organization) => {
    const membershipStatus = organization.membershipStatus?.toUpperCase();
    return !membershipStatus || membershipStatus === "ACTIVE";
  });


  const globalItems: NavItemProps[] = isSystemAdmin
    ? [
        {
          href: "/organizations",
          icon: <LayoutDashboard size={18} />,
          label: "All Organizations",
          isActive: pathname === "/organizations",
          collapsed,
        },
        {
          href: "/users",
          icon: <Users size={18} />,
          label: "All Users",
          isActive: pathname === "/users",
          collapsed,
        },
      ]
    : [
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

    if (perms.canViewProjects) {
      items.push({
        href: `/organizations/${slug}/projects`,
        icon: <FolderKanban size={16} />,
        label: "Projects",
        isActive: pathname === `/organizations/${slug}/projects`,
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

    return items;
  };

  return (
    <aside className={cn("sidebar", collapsed && "collapsed")}>
      {/* Header with Switcher */}
      <div 
        className={cn("sidebar-header", orgSlug && "has-switcher")}
        onClick={() => orgSlug && setIsOrgSwitcherOpen(!isOrgSwitcherOpen)}
        style={{ cursor: orgSlug ? "pointer" : "default" }}
      >
        <div 
          className="sidebar-logo"
          style={activeOrg ? { background: "var(--primary-soft)", color: "var(--primary)" } : {}}
        >
          {activeOrg ? activeOrg.name[0].toUpperCase() : "O"}
        </div>
        <div className="sidebar-brand-container">
          <span className="sidebar-brand">{activeOrg ? activeOrg.name : "Orchestrate"}</span>
          {orgSlug && <ChevronDown size={14} className={cn("switcher-chevron", isOrgSwitcherOpen && "open")} />}
        </div>
        {!collapsed && !orgSlug && (
          <button
            className="sidebar-toggle"
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapsed();
            }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        )}
      </div>

      {/* Org Switcher Dropdown */}
      {isOrgSwitcherOpen && !collapsed && (
        <div className="org-switcher-dropdown">
          <div className="org-switcher-label">Switch Organization</div>
          <div className="org-switcher-list">
            {organizations.map(org => (
              <Link 
                key={org.id}
                href={`/organizations/${org.slug}`}
                className={cn("org-switcher-item", org.slug === orgSlug && "active")}
                onClick={() => setIsOrgSwitcherOpen(false)}
              >
                <div className="org-switcher-logo">{org.name[0].toUpperCase()}</div>
                <div className="org-switcher-name">{org.name}</div>
                {org.slug === orgSlug && <div className="org-switcher-dot" />}
              </Link>
            ))}
            <div className="divider" style={{ margin: "4px 0" }} />
            <Link 
              href="/organizations" 
              className="org-switcher-item"
              onClick={() => setIsOrgSwitcherOpen(false)}
            >
              <LayoutDashboard size={14} />
              <div className="org-switcher-name">{isSystemAdmin ? "View All Organizations" : "View Organizations"}</div>
            </Link>
            {!isSystemAdmin && (
              <Link 
                href="/organizations/new" 
                className="org-switcher-item"
                onClick={() => setIsOrgSwitcherOpen(false)}
              >
                <PlusCircle size={14} />
                <div className="org-switcher-name">Create New Organization</div>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Nav body */}
      <div className="sidebar-body">
        {orgSlug && activeOrg ? (
          <>
            {/* Organization Menu */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {getOrgSubItems(activeOrg.slug, activeOrg.myRole || undefined).map((item) => (
                <NavItem key={item.href} {...item} collapsed={collapsed} />
              ))}
            </div>

            <div className="divider" style={{ marginTop: "12px", marginBottom: "12px", opacity: 0.5 }} />

            {/* Projects Section */}
            <div className="sidebar-section-header">
              <div className="sidebar-section-label">Projects</div>
              {perms.canCreateProject && !collapsed && !isSystemAdmin && (
                <Link href={`/organizations/${orgSlug}/projects/new`} className="sidebar-section-action" title="Create Project">
                  <Plus size={14} />
                </Link>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {projects.length > 0 ? (
                // Group projects by status
                defaultStatuses.map((status) => {
                  const statusProjects = projects.filter(p => p.status === status);
                  if (statusProjects.length === 0) return null;
                  
                  return (
                    <div key={status} className="stack" style={{ gap: "4px" }}>
                      {!collapsed && (
                        <div style={{ 
                          fontSize: 10, 
                          fontWeight: 700, 
                          color: "var(--text-muted)", 
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          padding: "4px 8px 2px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}>
                          <div style={{ 
                            width: 6, 
                            height: 6, 
                            borderRadius: "50%", 
                            background: status === "PLANNING" ? "var(--warning)" : "var(--success)" 
                          }} />
                          {status === "PLANNING" ? "Planning" : "Active"}
                          <span style={{ opacity: 0.6, fontWeight: 500 }}>({statusProjects.length})</span>
                        </div>
                      )}
                      {statusProjects.map((project) => {
                        const isExpanded = expandedProjects[project.slug];
                        const projectPath = `/organizations/${orgSlug}/projects/${project.slug}`;
                        
                        return (
                          <div key={project.id} className="stack" style={{ gap: "2px" }}>
                            <NavItem
                              href={projectPath}
                              icon={
                                <div style={{ position: "relative" }}>
                                  <Folder size={16} />
                                  {!collapsed && (
                                    <div style={{ 
                                      position: "absolute", 
                                      top: -2, 
                                      right: -2, 
                                      width: 6, 
                                      height: 6, 
                                      borderRadius: "50%", 
                                      background: status === "PLANNING" ? "var(--warning)" : "var(--success)",
                                      border: "1px solid var(--surface)"
                                    }} />
                                  )}
                                </div>
                              }
                              label={project.name}
                              isActive={pathname === projectPath}
                              collapsed={collapsed}
                              isExpandable={true}
                              isExpanded={isExpanded}
                              onClick={(e) => {
                                // If clicking on the already active project overview, just toggle
                                if (pathname === projectPath) {
                                  e.preventDefault();
                                  toggleProject(project.slug);
                                } else {
                                  // If navigating to a new project, expand it
                                  setExpandedProjects(prev => ({ ...prev, [project.slug]: true }));
                                }
                              }}
                            />
                            {isExpanded && !collapsed && (
                              <div className="sidebar-subnav expanded">
                                <div className="sidebar-subnav-inner">
                                  <NavItem
                                    href={projectPath}
                                    icon={<LayoutDashboard size={14} />}
                                    label="Dashboard"
                                    isActive={pathname === projectPath}
                                    collapsed={collapsed}
                                    isSubItem={true}
                                  />
                                  <NavItem
                                    href={`${projectPath}/board`}
                                    icon={<Kanban size={14} />}
                                    label="TaskBoard"
                                    isActive={pathname === `${projectPath}/board`}
                                    collapsed={collapsed}
                                    isSubItem={true}
                                  />
                                  <NavItem
                                    href={`${projectPath}/members`}
                                    icon={<Users size={14} />}
                                    label="Team"
                                    isActive={pathname === `${projectPath}/members`}
                                    collapsed={collapsed}
                                    isSubItem={true}
                                  />
                                  {(project.myRole === "MANAGER" || activeOrg?.myRole === "OWNER" || activeOrg?.myRole === "ADMIN") && (
                                    <NavItem
                                      href={`${projectPath}/settings`}
                                      icon={<Settings size={14} />}
                                      label="Settings"
                                      isActive={pathname === `${projectPath}/settings`}
                                      collapsed={collapsed}
                                      isSubItem={true}
                                    />
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              ) : !collapsed && (
                <div className="sidebar-empty-state">No active projects</div>
              )}
            </div>
          </>
        ) : (
          <SidebarSection label="General" collapsed={collapsed} items={globalItems} />
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
