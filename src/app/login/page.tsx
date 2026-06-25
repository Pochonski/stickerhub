"use client";

import { useAuth } from "@/presentation/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Mail, Trophy, LogIn } from "lucide-react";

export default function LoginPage() {
  const { user, loading, signIn, signInWithPassword } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer
  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Redirect to album after successful password login
  useEffect(() => {
    if (user && !loading && showPassword) {
      router.push("/album");
    }
  }, [user, loading, showPassword, router]);

  const handleLogin = async () => {
    if (!email || sending || cooldown > 0) return;
    if (showPassword && !password) return;
    setSending(true);
    setError("");

    const timeout = setTimeout(() => {
      setSending(false);
      setError("El servidor no responde. Intentá de nuevo.");
      setCooldown(15);
    }, 8000);

    try {
      if (showPassword) {
        await signInWithPassword(email, password);
      } else {
        await signIn(email);
      }
      clearTimeout(timeout);
      setSent(true);
    } catch (e: unknown) {
      clearTimeout(timeout);
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("Invalid login") || msg.includes("credentials")) {
        setError("Email o contraseña incorrectos.");
        setCooldown(5);
      } else if (msg.includes("429") || msg.includes("rate") || msg.includes("limit")) {
        setError("Demasiados intentos. Esperá 2 minutos.");
        setCooldown(120);
      } else {
        setError(showPassword ? "Error al ingresar." : "Error al enviar. Revisá el email.");
        setCooldown(15);
      }
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-10 max-w-[420px] w-full text-center shadow-sm">
        <Trophy size={48} strokeWidth={1.5} className="mx-auto mb-4 text-[var(--color-accent)]" />
        <h1 className="font-[var(--font-display)] text-[24px] font-bold mb-2">
          Sticker<span className="text-[var(--color-primary)]">Hub</span> FIFA
        </h1>
        <p className="text-sm text-[var(--color-muted)] mb-8">
          Ingresá tu email y te enviamos un link mágico para acceder a tu álbum del Mundial 2026.
        </p>

        {sent && !showPassword && (
          <div className="bg-[var(--color-accent-soft)] rounded-xl p-5 text-sm text-[var(--color-accent)]">
            <Mail size={28} className="mx-auto mb-3" strokeWidth={1.5} />
            <p className="font-semibold mb-1">¡Link mágico enviado!</p>
            <p className="opacity-70">
              Revisá <strong>{email}</strong> y hacé clic en el enlace para ingresar.
            </p>
          </div>
        )}

        {!sent && (
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
              disabled={sending || !email || cooldown > 0 || (showPassword && !password)}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[var(--color-accent)] text-white text-base font-semibold cursor-pointer border-none transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
            >
              {showPassword ? (
                <><LogIn size={16} /> {cooldown > 0 ? `Esperá ${cooldown}s...` : sending ? "Ingresando..." : "Ingresar"}</>
              ) : (
                <><Mail size={16} /> {cooldown > 0 ? `Esperá ${cooldown}s...` : sending ? "Enviando..." : "Enviar link mágico"}</>
              )}
            </button>

            {error && (
              <p className="text-xs text-[var(--color-danger)] mt-3">{error}</p>
            )}

            <button
              onClick={() => { setShowPassword(!showPassword); setError(""); }}
              className="mt-4 text-[11px] text-[var(--color-muted)]/50 hover:text-[var(--color-muted)] cursor-pointer bg-transparent border-none"
            >
              {showPassword ? "Usar link mágico" : "¿Tenés contraseña?"}
            </button>

            {showPassword && (
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-full border-[1.5px] border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-fg)] outline-none mt-3 text-center transition-colors focus:border-[var(--color-accent)]"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
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
