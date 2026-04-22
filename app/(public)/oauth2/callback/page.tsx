"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getMe } from "@/lib/api/auth";
import { setSessionUser } from "@/lib/session/client-session";

function LoadingState() {
  return (
    <main className="auth-stage">
      <div className="auth-glow auth-glow-left" aria-hidden="true" />
      <div className="auth-glow auth-glow-right" aria-hidden="true" />
      <div className="card oauth-card oauth-loading-card">
        <div className="oauth-spinner" aria-hidden="true" />
        <h1 className="oauth-title">Signing you in...</h1>
        <p className="oauth-subtitle">Please wait while we finish your Google authentication.</p>
      </div>
    </main>
  );
}

function OAuth2CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function completeOAuth2Login() {
      const oauthError = searchParams.get("error");
      if (oauthError) {
        setError(oauthError);
        return;
      }

      const token = searchParams.get("token");
      if (!token) {
        setError("Missing OAuth token. Please try again.");
        return;
      }

      try {
        const response = await fetch(`/api/auth/oauth2/callback?token=${encodeURIComponent(token)}`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          setError("Could not create a session from Google login.");
          return;
        }

        const me = await getMe();
        if (!cancelled) {
          setSessionUser(me);
          router.replace("/organizations");
        }
      } catch {
        if (!cancelled) {
          setError("Google sign-in failed. Please try again.");
        }
      }
    }

    completeOAuth2Login();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  if (error) {
    return (
      <main className="auth-stage">
        <div className="auth-glow auth-glow-left" aria-hidden="true" />
        <div className="auth-glow auth-glow-right" aria-hidden="true" />
        <div className="card oauth-card">
          <h1 className="oauth-title">Google sign-in failed</h1>
          <Alert tone="error">{error}</Alert>
          <Button type="button" onClick={() => router.replace("/login")}>Back to login</Button>
        </div>
      </main>
    );
  }

  return <LoadingState />;
}

export default function OAuth2CallbackPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <OAuth2CallbackContent />
    </Suspense>
  );
}
