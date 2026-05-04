"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { usePrefetchUsers, useUsersQuery } from "@/hooks/queries/useUsersQuery";
import { usePrefetchOrganizations, useOrganizationsQuery } from "@/hooks/queries/useOrganizationsQuery";

type TabKey = "users" | "organizations";

export function AdminTabs() {
  const [active, setActive] = useState<TabKey>("users");
  const params = useMemo(() => ({ page: 0, size: 20, q: "", sortBy: "createdAt,DESC" }), []);

  const usersQuery = useUsersQuery(params, active === "users");
  const orgsQuery = useOrganizationsQuery(params, active === "organizations");

  const prefetchUsers = usePrefetchUsers();
  const prefetchOrganizations = usePrefetchOrganizations();

  return (
    <div className="stack" style={{ gap: "12px" }}>
      <div className="row" style={{ gap: "8px" }}>
        <Button
          variant={active === "users" ? "primary" : "ghost"}
          onMouseEnter={() => prefetchUsers(params)}
          onClick={() => setActive("users")}
        >
          Users
        </Button>
        <Button
          variant={active === "organizations" ? "primary" : "ghost"}
          onMouseEnter={() => prefetchOrganizations(params)}
          onClick={() => setActive("organizations")}
        >
          Organizations
        </Button>
        <Button variant="ghost" onClick={() => (active === "users" ? usersQuery.refetch() : orgsQuery.refetch())}>
          Refetch
        </Button>
      </div>

      {active === "users" ? (
        <div className="card" style={{ padding: "16px" }}>
          {usersQuery.isLoading ? "Loading users..." : `Users loaded: ${usersQuery.data?.totalElements ?? 0}`}
        </div>
      ) : (
        <div className="card" style={{ padding: "16px" }}>
          {orgsQuery.isLoading ? "Loading organizations..." : `Organizations loaded: ${orgsQuery.data?.totalElements ?? 0}`}
        </div>
      )}
    </div>
  );
}
