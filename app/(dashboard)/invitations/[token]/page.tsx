"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { ApiClientError } from "@/lib/api/error";
import {
  useAcceptInvitationMutation,
  useDeclineInvitationMutation,
  useValidateInvitationMutation,
} from "@/lib/query/organization-hooks";

export default function InvitationTokenPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const router = useRouter();
  const { push } = useToast();

  const validateMutation = useValidateInvitationMutation();
  const acceptMutation = useAcceptInvitationMutation();
  const declineMutation = useDeclineInvitationMutation();

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    validateMutation
      .mutateAsync(token)
      .then((response) => {
        setStatusMessage(response.message);
      })
      .catch((error) => {
        if (error instanceof ApiClientError) {
          setStatusError(error.message);
        } else {
          setStatusError("Unable to validate invitation token.");
        }
      });
  }, [token, validateMutation]);

  return (
    <div className="page-shell">
      <Card>
        <h1>Invitation response</h1>
        <p>Validate your invitation token, then accept or decline.</p>
      </Card>

      <Card className="stack">
        {validateMutation.isPending ? <Alert tone="info">Validating token...</Alert> : null}
        {statusMessage ? <Alert tone="success">{statusMessage}</Alert> : null}
        {statusError ? <Alert tone="error">{statusError}</Alert> : null}

        <div className="row">
          <Button
            variant="primary"
            loading={acceptMutation.isPending}
            disabled={!!statusError || validateMutation.isPending}
            onClick={async () => {
              try {
                await acceptMutation.mutateAsync(token);
                push({ title: "Invitation accepted", kind: "success" });
                router.replace("/organizations");
              } catch (error) {
                if (error instanceof ApiClientError) {
                  setStatusError(error.message);
                } else {
                  setStatusError("Unable to accept invitation.");
                }
              }
            }}
          >
            Accept invitation
          </Button>

          <Button
            variant="danger"
            loading={declineMutation.isPending}
            disabled={!!statusError || validateMutation.isPending}
            onClick={async () => {
              try {
                await declineMutation.mutateAsync(token);
                push({ title: "Invitation declined", kind: "info" });
                router.replace("/organizations");
              } catch (error) {
                if (error instanceof ApiClientError) {
                  setStatusError(error.message);
                } else {
                  setStatusError("Unable to decline invitation.");
                }
              }
            }}
          >
            Decline invitation
          </Button>
        </div>
      </Card>
    </div>
  );
}
