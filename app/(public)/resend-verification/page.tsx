import { Suspense } from "react";
import { ResendVerificationClient } from "@/app/(public)/resend-verification/resend-verification-client";

export default function ResendVerificationPage() {
  return (
    <Suspense fallback={<main className="page-shell">Loading...</main>}>
      <ResendVerificationClient />
    </Suspense>
  );
}
