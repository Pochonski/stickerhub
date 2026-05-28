"use client";

import { useState, useCallback, useRef } from "react";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "warning" | "error" | "info";
}

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = String(++toastId);
    setToasts((prev) => [...prev, { id, message, type }]);

    const timeout = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      timeouts.current.delete(id);
    }, 3500);

    timeouts.current.set(id, timeout);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const t = timeouts.current.get(id);
    if (t) {
      clearTimeout(t);
      timeouts.current.delete(id);
    }
  }, []);

  return { toasts, addToast, removeToast };
}
