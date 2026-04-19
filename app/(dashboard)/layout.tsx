import { ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { MainContent } from "@/components/dashboard/main-content";
import { requireAuth } from "@/lib/auth/server-auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireAuth();

  return (
    <div className="app-shell">
      <Sidebar />
      <MainContent>
        <Topbar />
        <main style={{ flex: 1 }}>{children}</main>
      </MainContent>
    </div>
  );
}
