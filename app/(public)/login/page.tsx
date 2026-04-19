"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { z } from "zod";
import { AuthShell } from "@/components/auth/auth-shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { ApiClientError } from "@/lib/api/error";
import { useLoginMutation } from "@/lib/query/auth-hooks";
import { loginSchema } from "@/lib/validation";

const schema = loginSchema;

export default function LoginPage() {
  const router = useRouter();
  const { push } = useToast();
  const loginMutation = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const canSubmit = useMemo(() => email.length > 0 && password.length > 0, [email, password]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setGeneralError(null);

    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (typeof key === "string") {
          nextErrors[key] = issue.message;
        }
      });
      setFieldErrors(nextErrors);
      return;
    }

    try {
      await loginMutation.mutateAsync(parsed.data);
      push({ title: "Welcome back", kind: "success" });
      router.replace("/organizations");
    } catch (error) {
      if (error instanceof ApiClientError) {
        setGeneralError(error.message);
        setFieldErrors(error.details ?? {});
      } else if (error instanceof z.ZodError) {
        setGeneralError("Invalid form input");
      } else {
        setGeneralError("Could not sign in. Please try again.");
      }
    }
  }

  return (
    <AuthShell
      title="Login to Orchestrate"
      subtitle="Manage organizations, members, invitations, and projects from one place."
      alternateLabel="Need an account? Register"
      alternateHref="/register"
    >
      <form onSubmit={onSubmit} className="form-grid" noValidate>
        {generalError ? <Alert tone="error">{generalError}</Alert> : null}

        <FormField label="Email" htmlFor="email" error={fieldErrors.email}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={fieldErrors.email}
            required
          />
        </FormField>

        <FormField label="Password" htmlFor="password" error={fieldErrors.password}>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={fieldErrors.password}
            required
          />
        </FormField>

        <Button type="submit" loading={loginMutation.isPending} disabled={!canSubmit}>
          Sign in
        </Button>
      </form>

      <Link href="/verify" style={{ color: "#214f95", fontWeight: 600 }}>
        Didn&apos;t get the verification email?
      </Link>
    </AuthShell>
  );
}
