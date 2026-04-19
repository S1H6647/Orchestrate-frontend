"use client";

import { useEffect, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "orchestrate:sidebar-collapsed";

export function MainContent({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Read initial state
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "true");

    // Listen for changes from the sidebar toggle
    const handler = () => {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "true");
    };

    window.addEventListener("storage", handler);

    // Also poll because storage event only fires in other tabs
    // We sync via a custom event dispatched by the sidebar
    window.addEventListener("sidebar-toggle", handler);

    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("sidebar-toggle", handler);
    };
  }, []);

  return (
    <div className={cn("main-content", collapsed && "sidebar-collapsed")}>
      {children}
    </div>
  );
}
