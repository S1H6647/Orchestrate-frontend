import { Suspense } from "react";
import { VerifyClient } from "@/app/(public)/verify/verify-client";

export default function VerifyPage() {
  return (
    <Suspense fallback={<main className="page-shell">Loading verification...</main>}>
      <VerifyClient />
    </Suspense>
  );
}
