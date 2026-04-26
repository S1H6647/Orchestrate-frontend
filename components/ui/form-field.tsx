import { ReactNode } from "react";

type Props = {
  label: ReactNode;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
};

export function FormField({ label, htmlFor, error, hint, required, children }: Props) {
  return (
    <label className="field" htmlFor={htmlFor}>
      <span className="field-label">
        {label}
        {required && <span style={{ color: "var(--danger)", marginLeft: "4px" }}>*</span>}
      </span>
      {children}
      {error ? <span className="field-error">{error}</span> : null}
      {!error && hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}
