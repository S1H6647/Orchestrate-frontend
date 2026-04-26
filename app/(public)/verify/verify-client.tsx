"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { ApiClientError } from "@/lib/api/error";
import { useResendVerificationMutation, useVerifyMutation } from "@/lib/query/auth-hooks";

export function VerifyClient() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const defaultEmail = params.get("email") ?? "";

  const { push } = useToast();
  const verifyMutation = useVerifyMutation();
  const resendMutation = useResendVerificationMutation();
  const [email, setEmail] = useState(defaultEmail);

  useEffect(() => {
    if (!token) {
      return;
    }

    verifyMutation
      .mutateAsync(token)
      .then((response) => {
        push({ title: response.message, kind: "success" });
      })
      .catch((error) => {
        push({ 
          title: "Verification failed", 
          description: error instanceof ApiClientError ? error.message : "Unable to verify account.", 
          kind: "error" 
        });
      });
  }, [token, verifyMutation]);

  async function onResend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const response = await resendMutation.mutateAsync(email);
      push({ title: response.message, kind: "success" });
    } catch (error) {
      push({ 
        title: "Failed to resend", 
        description: error instanceof ApiClientError ? error.message : "Unable to resend verification email.", 
        kind: "error" 
      });
    }
  }

  return (
    <AuthShell
      title="Verify your account"
      subtitle="Use the link from your email or resend a new verification message."
      alternateLabel="Back to login"
      alternateHref="/login"
    >
      {token ? (
        <div className="stack">
          {verifyMutation.isPending ? <Alert tone="info">Verifying account...</Alert> : null}
        </div>
      ) : null}

      <form className="form-grid" onSubmit={onResend} noValidate>
        <FormField label="Email" htmlFor="email" hint="We will resend your verification link.">
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
