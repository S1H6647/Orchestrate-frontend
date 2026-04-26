"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
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

  const canSubmit = useMemo(() => email.length > 0 && password.length > 0, [email, password]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setFieldErrors({});

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
        setFieldErrors(error.details ?? {});
        push({ title: "Login failed", description: error.message, kind: "error" });
      } else if (error instanceof z.ZodError) {
        push({ title: "Login failed", description: "Invalid form input", kind: "error" });
      } else {
        push({ title: "Login failed", description: "Could not sign in. Please try again.", kind: "error" });
      }
    }
  }

  function continueWithGoogle() {
    window.location.assign("/api/auth/oauth2/google");
  }

  return (
    <AuthShell
      title="Login to Orchestrate"
      subtitle="Manage organizations, members, invitations, and projects from one place."
      alternateLabel="Need an account? Register"
      alternateHref="/register"
    >
      <form onSubmit={onSubmit} className="form-grid" noValidate>

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

      <div className="auth-divider">
        <div className="auth-divider-line" />
        <span className="auth-divider-text">or continue with</span>
        <div className="auth-divider-line" />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={continueWithGoogle}
        icon={<FontAwesomeIcon icon={faGoogle} />}
        className="auth-google-btn"
      >
        Continue with Google
      </Button>

      <Link href="/verify" className="auth-verify-link">
        Didn&apos;t get the verification email?
      </Link>
    </AuthShell>
  );
}
