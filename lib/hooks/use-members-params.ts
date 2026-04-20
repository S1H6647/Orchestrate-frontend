import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { AllMemberStatus, AllOrganizationRole } from "@/lib/api/types";

export function useMembersParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const params = useMemo(() => {
    return {
      q: searchParams.get("q") ?? "",
      status: (searchParams.get("status") as AllMemberStatus) ?? "ACTIVE",
      role: (searchParams.get("role") as AllOrganizationRole) ?? "ALL",
      page: Number(searchParams.get("page") ?? "0"),
      size: Number(searchParams.get("size") ?? "10"),
      sortBy: searchParams.get("sortBy") ?? "joinedAt,desc",
    };
  }, [searchParams]);

  const setParams = useCallback(
    (newParams: Partial<typeof params>) => {
      const sp = new URLSearchParams(searchParams.toString());
      
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          sp.delete(key);
        } else {
          sp.set(key, String(value));
        }
      });

      // Reset page to 0 if filters change
      if (
        newParams.q !== undefined ||
        newParams.status !== undefined ||
        newParams.role !== undefined ||
        newParams.size !== undefined
      ) {
        sp.set("page", "0");
      }

      router.push(`${pathname}?${sp.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return { params, setParams };
}
