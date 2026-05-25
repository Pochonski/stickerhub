"use client";

import type { Toast } from "@/hooks/useToast";

const typeStyles: Record<Toast["type"], string> = {
  success: "bg-[oklch(94%_0.06_156)] text-[var(--color-success)] border-[var(--color-success)]",
  warning: "bg-[oklch(95%_0.06_72)] text-[var(--color-warning)] border-[var(--color-warning)]",
  error: "bg-[oklch(94%_0.05_22)] text-[var(--color-danger)] border-[var(--color-danger)]",
  info: "bg-[var(--color-accent-soft)] text-[var(--color-accent)] border-[var(--color-accent)]",
};

export function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border text-sm font-semibold shadow-lg cursor-pointer animate-slide-up ${typeStyles[toast.type]}`}
          onClick={() => onRemove(toast.id)}
        >
          <span className="flex-1">{toast.message}</span>
          <button className="text-current opacity-50 hover:opacity-100 text-lg leading-none" aria-label="Cerrar notificación">&times;</button>
        </div>
      ))}
    </div>
  );
}
