"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { TEAM_LIST } from "@/data/teams";
import type { Team } from "@/data/types";

interface TeamSelectModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (team: Team) => void;
}

export function TeamSelectModal({ open, onClose, onSelect }: TeamSelectModalProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const filtered = query
    ? TEAM_LIST.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()))
    : TEAM_LIST;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] p-6 max-w-[560px] w-[92%] max-h-[85vh] flex flex-col shadow-xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-[var(--font-display)] text-xl font-bold">Elegí una selección</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full grid place-items-center hover:bg-[var(--color-border)] transition-colors cursor-pointer border-none bg-transparent text-[var(--color-muted)]"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="relative mb-4">
          <Search size={16} strokeWidth={2} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)] pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar selección..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full border-[1.5px] border-[var(--color-border)] bg-[var(--color-surface)] text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 overflow-y-auto pr-1 max-sm:grid-cols-2">
          {filtered.map((team) => (
            <button
              key={team.id}
              onClick={() => onSelect(team)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-[var(--color-accent-soft)] active:bg-[var(--color-accent-soft)] transition-colors cursor-pointer border-none bg-transparent text-left"
            >
              <span className="text-lg shrink-0">{team.flag}</span>
              <span className="text-[13px] font-semibold text-[var(--color-fg)] leading-tight truncate">{team.name}</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-sm text-[var(--color-muted)] py-8">No se encontraron selecciones</p>
        )}
      </div>
    </div>
  );
}
