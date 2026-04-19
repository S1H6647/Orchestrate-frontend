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
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(37, 99, 235, 0.1) 0%, transparent 60%), var(--bg)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo / Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "28px",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "linear-gradient(135deg, var(--primary), #7c8df9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: 18,
              fontFamily: "var(--font-display)",
            }}
          >
            O
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.3px", fontFamily: "var(--font-display)" }}>
            Orchestrate
          </span>
        </div>

        {/* Card */}
        <div
          className="card"
          style={{ padding: "28px 28px 24px", boxShadow: "var(--shadow-lg)" }}
        >
          <div style={{ marginBottom: "20px" }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{title}</h1>
            <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>{subtitle}</p>
          </div>

          {children}

          <div
            style={{
              marginTop: "16px",
              paddingTop: "16px",
              borderTop: "1px solid var(--border)",
              textAlign: "center",
            }}
          >
            <Link
              href={alternateHref}
              style={{
                fontSize: 13.5,
                color: "var(--primary)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              {alternateLabel}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
