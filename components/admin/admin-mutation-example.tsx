"use client";

import { Button } from "@/components/ui/button";
import { useCreateUserMutation } from "@/hooks/queries/useAdminMutations";

export function AdminMutationExample() {
  const createUserMutation = useCreateUserMutation();

  return (
    <Button
      loading={createUserMutation.isPending}
      onClick={() =>
        createUserMutation.mutate({
          name: "Admin Created",
          email: `admin-created-${Date.now()}@example.com`,
          password: "TempPass123!",
        })
      }
    >
      Create User (Example)
    </Button>
  );
}
