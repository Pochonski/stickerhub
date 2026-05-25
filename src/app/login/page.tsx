"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Mail, Trophy } from "lucide-react";

export default function LoginPage() {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleLogin = async () => {
    if (!email || sending || cooldown > 0) return;
    setSending(true);
    setError("");
    try {
      await signIn(email);
      setSent(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("429") || msg.includes("rate") || msg.includes("Too Many")) {
        setError("Demasiados intentos. Esperá un minuto y probá de nuevo.");
        setCooldown(60);
      } else {
        setError("Error al enviar. Revisá el email e intentá de nuevo.");
      }
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-10 max-w-[420px] w-full text-center shadow-sm">
        <Trophy size={48} strokeWidth={1.5} className="mx-auto mb-4 text-[var(--color-accent)]" />
        <h1 className="font-[var(--font-display)] text-[24px] font-bold mb-2">
          Álbum Virtual FIFA
        </h1>
        <p className="text-sm text-[var(--color-muted)] mb-8">
          Ingresá tu email y te enviamos un link mágico para acceder a tu álbum del Mundial 2026.
        </p>

        {sent ? (
          <div className="bg-[var(--color-accent-soft)] rounded-xl p-5 text-sm text-[var(--color-accent)]">
            <Mail size={28} className="mx-auto mb-3" strokeWidth={1.5} />
            <p className="font-semibold mb-1">¡Link mágico enviado!</p>
            <p className="opacity-70">
              Revisá <strong>{email}</strong> y hacé clic en el enlace para ingresar. No necesitás contraseña.
            </p>
          </div>
        ) : (
          <>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-full border-[1.5px] border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-fg)] outline-none mb-3 text-center transition-colors focus:border-[var(--color-accent)]"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <button
              onClick={handleLogin}
              disabled={sending || !email || cooldown > 0}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[var(--color-accent)] text-white text-base font-semibold cursor-pointer border-none transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
            >
              <Mail size={16} />
              {cooldown > 0 ? `Esperá ${cooldown}s...` : sending ? "Enviando..." : "Enviar link mágico"}
            </button>

            {error && (
              <p className="text-xs text-[var(--color-danger)] mt-3">{error}</p>
            )}
          </>
        )}

        <p className="text-xs text-[var(--color-muted)] mt-6">
          Sin contraseñas. Solo necesitás acceso a tu correo.
        </p>
      </div>
    </div>
  );
}
