import Link from "next/link";
import { ReactNode } from "react";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
  alternateLabel: string;
  alternateHref: string;
};

export function AuthShell({ title, subtitle, children, alternateLabel, alternateHref }: Props) {
  return (
    <main className="auth-stage">
      <div className="auth-glow auth-glow-left" aria-hidden="true" />
      <div className="auth-glow auth-glow-right" aria-hidden="true" />

      <div className="auth-shell">
        <div className="auth-brand-wrap">
          <div className="auth-brand-pill">Team Workspace</div>

          <div className="auth-brand">
            <div className="auth-brand-icon">O</div>
            <span className="auth-brand-text">Orchestrate</span>
          </div>
        </div>

        <div className="card auth-card">
          <div className="auth-card-head">
            <h1 className="auth-card-title">{title}</h1>
            <p className="auth-card-subtitle">{subtitle}</p>
          </div>

          <div className="auth-card-body">{children}</div>

          <div className="auth-card-footer">
            <Link href={alternateHref} className="auth-card-link">
              {alternateLabel}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
