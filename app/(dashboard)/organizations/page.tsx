"use client";

import Link from "next/link";
import { Building2, ExternalLink, Plus } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useMyOrganizationsQuery } from "@/lib/query/organization-hooks";

export default function OrganizationsPage() {
  const organizationsQuery = useMyOrganizationsQuery();

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

  const items = organizationsQuery.data ?? [];

  return (
    <div className="page-shell">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Organizations</h1>
          <p className="page-description">Manage your workspaces and switch between organizations.</p>
        </div>
        <Link href="/organizations/new">
          <Button icon={<Plus size={18} />}>New Organization</Button>
        </Link>
      </div>

      {/* Content */}
      {items.length === 0 ? (
        <EmptyState
          title="No organizations yet"
          description="Create your first organization to start inviting members and managing projects."
          actionHref="/organizations/new"
          actionLabel="Create organization"
          icon={<Building2 size={32} />}
        />
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {items.map((organization) => (
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
    </div>
  );
}
