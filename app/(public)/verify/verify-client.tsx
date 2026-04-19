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
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    verifyMutation
      .mutateAsync(token)
      .then((response) => {
        setVerifyMessage(response.message);
        setVerifyError(null);
      })
      .catch((error) => {
        if (error instanceof ApiClientError) {
          setVerifyError(error.message);
        } else {
          setVerifyError("Unable to verify account.");
        }
      });
  }, [token, verifyMutation]);

  async function onResend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResendError(null);
    setResendMessage(null);
    try {
      const response = await resendMutation.mutateAsync(email);
      setResendMessage(response.message);
      push({ title: response.message, kind: "success" });
    } catch (error) {
      if (error instanceof ApiClientError) {
        setResendError(error.message);
      } else {
        setResendError("Unable to resend verification email.");
      }
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
          {verifyMessage ? <Alert tone="success">{verifyMessage}</Alert> : null}
          {verifyError ? <Alert tone="error">{verifyError}</Alert> : null}
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
        {resendMessage ? <Alert tone="success">{resendMessage}</Alert> : null}
        {resendError ? <Alert tone="error">{resendError}</Alert> : null}
        <Button type="submit" loading={resendMutation.isPending} disabled={!email}>
          Resend verification email
        </Button>
      </form>
    </AuthShell>
  );
}
