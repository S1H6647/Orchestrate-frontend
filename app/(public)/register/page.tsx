"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { ApiClientError } from "@/lib/api/error";
import { useRegisterMutation } from "@/lib/query/auth-hooks";
import { registerSchema } from "@/lib/validation";

export default function RegisterPage() {
  const router = useRouter();
  const { push } = useToast();
  const registerMutation = useRegisterMutation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setFieldErrors({});

    const parsed = registerSchema.safeParse({ name, email, password });
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
      await registerMutation.mutateAsync(parsed.data);
      push({ title: "Account created. Please verify your email.", kind: "success" });
      router.replace(`/verify?email=${encodeURIComponent(parsed.data.email)}`);
    } catch (error) {
      if (error instanceof ApiClientError) {
        setFieldErrors(error.details ?? {});
        push({ title: "Registration failed", description: error.message, kind: "error" });
      } else {
        push({ title: "Registration failed", description: "Unable to register right now.", kind: "error" });
      }
    }
  }

  return (
    <AuthShell
      title="Create your Orchestrate account"
      subtitle="Start collaborating with your team across organizations and projects."
      alternateLabel="Already registered? Login"
      alternateHref="/login"
    >
      <form className="form-grid" onSubmit={onSubmit} noValidate>

        <FormField label="Name" htmlFor="name" error={fieldErrors.name}>
          <Input id="name" value={name} onChange={(event) => setName(event.target.value)} error={fieldErrors.name} />
        </FormField>

        <FormField label="Email" htmlFor="email" error={fieldErrors.email}>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={fieldErrors.email}
          />
        </FormField>

        <FormField label="Password" htmlFor="password" error={fieldErrors.password} hint="Minimum 8 characters.">
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={fieldErrors.password}
          />
        </FormField>

        <Button type="submit" loading={registerMutation.isPending}>
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
