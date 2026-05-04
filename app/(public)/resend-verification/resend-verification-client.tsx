"use client";

import { FormEvent, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { ApiClientError } from "@/lib/api/error";
import { useResendVerificationMutation } from "@/lib/query/auth-hooks";

export function ResendVerificationClient() {
  const { push } = useToast();
  const resendMutation = useResendVerificationMutation();
  const [email, setEmail] = useState("");

  async function onResend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const response = await resendMutation.mutateAsync(email);
      push({ title: response.message, kind: "success" });
    } catch (error) {
      push({
        title: "Failed to resend",
        description: error instanceof ApiClientError ? error.message : "Unable to resend verification email.",
        kind: "error",
      });
    }
  }

  return (
    <AuthShell
      title="Resend verification"
      subtitle="Enter your email and we'll send a new verification link."
      alternateLabel="Back to login"
      alternateHref="/login"
    >
      <div className="stack">
        {resendMutation.isSuccess ? (
          <Alert tone="success">Check your inbox. A fresh verification link is on its way.</Alert>
        ) : null}
      </div>

      <form className="form-grid" onSubmit={onResend} noValidate>
        <FormField label="Email" htmlFor="email" hint="We'll resend your verification link.">
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </FormField>
        <Button type="submit" loading={resendMutation.isPending} disabled={!email}>
          Resend verification email
        </Button>
      </form>
    </AuthShell>
  );
}
