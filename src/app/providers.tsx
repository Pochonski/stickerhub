"use client";

import { useState, useEffect, type ReactNode } from "react";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { GameProvider } from "@/context/GameContext";

function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6">
      <div className="w-12 h-12 rounded-lg bg-[var(--color-accent-soft)] animate-pulse" />
      <div className="flex flex-col items-center gap-3 w-full max-w-[320px]">
        <div className="h-4 w-3/4 rounded-full bg-[var(--color-border)] animate-pulse" />
        <div className="h-3 w-1/2 rounded-full bg-[var(--color-border)] animate-pulse" />
      </div>
    </div>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <AuthProvider>
      <GameProvider>
        {mounted ? children : <LoadingSkeleton />}
      </GameProvider>
    </AuthProvider>
  );
}
