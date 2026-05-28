"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after the auth check is fully complete
    // Use a small delay to avoid race conditions with session refresh
    if (loading) return;
    const timer = setTimeout(() => {
      if (!user) {
        router.push("/login");
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-accent)] border-t-transparent animate-spin" />
        <p className="text-sm text-[var(--color-muted)]">Verificando sesión...</p>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
