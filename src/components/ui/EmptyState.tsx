import type { ReactNode } from "react";

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">{icon}</div>
      <h3 className="text-lg font-semibold text-[var(--color-fg)] mb-2 font-[var(--font-display)]">{title}</h3>
      <p className="text-sm text-[var(--color-muted)] max-w-[360px] mx-auto mb-6">{description}</p>
      {action}
    </div>
  );
}
