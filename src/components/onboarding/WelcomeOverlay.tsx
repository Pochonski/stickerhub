"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useGame } from "@/context/GameContext";
import { PackageOpen, BookOpen } from "lucide-react";

export function WelcomeOverlay() {
  const { user } = useUser();
  const { state } = useGame();
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!user) return;
    const key = `stickerhub-welcome-${user.id}`;
    const seen = localStorage.getItem(key);
    if (!seen) {
      setShow(true);
    }
  }, [user]);

  const dismiss = () => {
    if (user) {
      localStorage.setItem(`stickerhub-welcome-${user.id}`, "true");
    }
    setShow(false);
  };

  if (!show) return null;

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Coleccionista";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] p-8 max-w-[440px] w-[90%] text-center shadow-2xl animate-slide-up">
        <span className="text-5xl block mb-4">🏆</span>
        <h2 className="font-[var(--font-display)] text-[28px] font-extrabold tracking-tight mb-2">
          ¡Bienvenido a StickerHub, {displayName}!
        </h2>
        <p className="text-sm text-[var(--color-muted)] mb-6 leading-relaxed">
          Tenés <strong className="text-[var(--color-accent)]">{state.packs} sobres gratis</strong> para empezar tu colección del Mundial 2026.
          Abrí tu primer sobre y descubrí qué stickers te tocaron.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={() => { dismiss(); router.push("/pack-opener"); }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--color-primary)] text-white text-base font-semibold cursor-pointer border-none transition-colors hover:bg-[var(--color-primary-hover)]"
          >
            <PackageOpen size={18} strokeWidth={2} /> Abrir mi primer sobre
          </button>
          <button
            onClick={() => { dismiss(); router.push("/album/flipbook"); }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-[1.5px] border-[var(--color-border)] text-[var(--color-fg)] text-base font-semibold cursor-pointer transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            <BookOpen size={18} strokeWidth={2} /> Explorar colección
          </button>
        </div>

        <button
          onClick={dismiss}
          className="mt-4 text-xs text-[var(--color-muted)] hover:text-[var(--color-fg)] cursor-pointer bg-transparent border-none"
        >
          Después lo veo
        </button>
      </div>
    </div>
  );
}
