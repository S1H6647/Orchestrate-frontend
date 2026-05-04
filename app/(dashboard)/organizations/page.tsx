"use client";

import Link from "next/link";
import { Building2, ExternalLink, Plus, Search } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { useMeQuery } from "@/lib/query/auth-hooks";
import { useMyOrganizationsQuery } from "@/lib/query/organization-hooks";
import { useOrganizationsQuery } from "@/hooks/queries/useOrganizationsQuery";
import { useMemo, useState } from "react";

export default function OrganizationsPage() {
  const meQuery = useMeQuery();
  const isSystemAdmin = meQuery.data?.systemRole === "SYSTEM_ADMIN";
  const [search, setSearch] = useState("");
  const [queryParams, setQueryParams] = useState({ page: 0, size: 20, sortBy: "createdAt,DESC", q: "" });
  const allOrganizationsQuery = useOrganizationsQuery(queryParams, isSystemAdmin);
  const myOrganizationsQuery = useMyOrganizationsQuery();
  const organizationsQuery = isSystemAdmin ? allOrganizationsQuery : myOrganizationsQuery;

  const data = organizationsQuery.data;
  const items = Array.isArray(data) ? data : data?.content ?? [];
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((organization) =>
      `${organization.name} ${organization.slug} ${organization.plan} ${organization.status}`
        .toLowerCase()
        .includes(query)
    );
  }, [items, search]);

  if (organizationsQuery.isLoading) {
    return (
      <div className="page-shell">
        <LoadingState rows={5} />
      </div>
    );
  }

  if (organizationsQuery.isError) {
    return (
      <div className="page-shell">
        <Alert tone="error">Could not load organizations.</Alert>
      </div>
    );
  }

  return (
    <div className="page-shell">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Organizations</h1>
          <p className="page-description">Manage your workspaces and switch between organizations.</p>
        </div>
        <div className="row" style={{ gap: "10px" }}>
          <div style={{ position: "relative", minWidth: 240 }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <Input
              value={search}
              onChange={(event) => {
                const value = event.target.value;
                setSearch(value);
                if (isSystemAdmin) {
                  setQueryParams((prev) => ({ ...prev, page: 0, q: value.trim() || "" }));
                }
              }}
              placeholder="Search organizations"
              style={{ paddingLeft: 34 }}
            />
          </div>
          {!isSystemAdmin && (
            <Link href="/organizations/new">
              <Button icon={<Plus size={18} />}>New Organization</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <EmptyState
          title={search ? "No matches" : "No organizations yet"}
          description={
            search
              ? "Try a different search term."
              : isSystemAdmin
                ? "There are no organizations registered yet."
                : "Create your first organization to start inviting members and managing projects."
          }
          actionHref={search || isSystemAdmin ? undefined : "/organizations/new"}
          actionLabel={search || isSystemAdmin ? undefined : "Create organization"}
          icon={<Building2 size={32} />}
        />
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {filtered.map((organization) => (
            <Link 
              key={organization.id} 
              href={`/organizations/${organization.slug}`}
              style={{ textDecoration: "none", display: "block" }}
            >
              <div 
                className="card" 
                style={{ 
                  padding: "24px 32px", 
                  cursor: "pointer",
                  transition: "all 150ms ease"
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--primary)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-md)";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "";
                  (e.currentTarget as HTMLDivElement).style.transform = "";
                }}
              >
                <div className="row" style={{ justifyContent: "space-between", gap: "16px" }}>
                  <div className="row" style={{ gap: "20px", flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: 14,
                        background: "var(--primary-soft)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--primary)",
                        fontWeight: 800,
                        fontSize: 20,
                        flexShrink: 0,
                      }}
                    >
                      {organization.logoUrl ? (
                         <img 
                           src={organization.logoUrl} 
                           alt={organization.name} 
                           style={{ width: "100%", height: "100%", borderRadius: "inherit", objectFit: "cover" }} 
                         />
                      ) : (
                        organization.name[0].toUpperCase()
                      )}
                    </div>
                    <div className="stack" style={{ gap: "3px", minWidth: 0 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>
                        {organization.name}
                      </span>
                      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                        /{organization.slug} &middot; {organization.plan}
                      </span>
                    </div>
                  </div>
                  <div className="row" style={{ gap: "12px", flexShrink: 0 }}>
                    <span className={`badge ${organization.status === "ACTIVE" ? "badge-success" : "badge-muted"}`} style={{ padding: "4px 10px" }}>
                      {organization.status}
                    </span>
                    <ExternalLink size={16} style={{ color: "var(--text-muted)", opacity: 0.4 }} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isSystemAdmin && !Array.isArray(data) && data ? (
        <Pagination
          currentPage={data.number}
          totalPages={data.totalPages}
          pageSize={data.size}
          totalElements={data.totalElements}
          onPageChange={(page) => setQueryParams((prev) => ({ ...prev, page }))}
          onPageSizeChange={(size) => setQueryParams((prev) => ({ ...prev, size, page: 0 }))}
        />
      ) : null}
    </div>
  );
}
