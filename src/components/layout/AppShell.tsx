"use client";

import { useState, useEffect, type ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { ToastContainer } from "./ToastContainer";
import { useToast } from "@/hooks/useToast";

function ShellSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <div className="h-4 w-48 rounded-full bg-[var(--color-border)] animate-pulse" />
      <div className="h-3 w-32 rounded-full bg-[var(--color-border)] animate-pulse" />
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { toasts, removeToast } = useToast();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="max-w-[1200px] mx-auto px-6 max-sm:px-4">
      <AppHeader />
      {mounted ? children : <ShellSkeleton />}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
