import type { ReactNode } from "react";

type PillVariant = "accent" | "field" | "success" | "warning";

const variants: Record<PillVariant, string> = {
  accent: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
  field: "bg-[var(--color-field-soft)] text-[var(--color-field)]",
  success: "bg-[oklch(94%_0.06_156)] text-[var(--color-success)]",
  warning: "bg-[oklch(95%_0.06_72)] text-[var(--color-warning)]",
};

export function Pill({ children, variant = "accent", className = "" }: { children: ReactNode; variant?: PillVariant; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
