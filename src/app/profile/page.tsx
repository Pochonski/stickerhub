"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Pill } from "@/components/ui/Pill";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAuth } from "@/components/auth/AuthProvider";
import { useUser } from "@/hooks/useUser";
import { useGame } from "@/context/GameContext";
import { ALL_PLAYERS } from "@/data/players";
import { ALL_STADIUM_CARDS, ALL_VENUE_CARDS } from "@/data/cards";
import { Medal, Star, Gem, Crown, Send, Inbox, Handshake, Award, BadgeCheck, LogOut } from "lucide-react";

function ProfileContent() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { state, isCollected } = useGame();

  // Use real user data when authenticated
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Coleccionista";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const userEmail = user?.email || "—";
  const createdAt = user?.created_at ? new Date(user.created_at).toLocaleDateString("es-CR", { year: "numeric", month: "long" }) : "—";

  const totalCollected = Object.keys(state.collected).length;
  const totalAll = ALL_PLAYERS.length + ALL_STADIUM_CARDS.length + ALL_VENUE_CARDS.length;
  const pct = totalAll > 0 ? Math.round((totalCollected / totalAll) * 100) : 0;
  const playerCollected = ALL_PLAYERS.filter((p) => isCollected(p.id)).length;
  const stadiumCollected = ALL_STADIUM_CARDS.filter((c) => isCollected(c.id)).length;
  const venueCollected = ALL_VENUE_CARDS.filter((c) => isCollected(c.id)).length;
  const completedTrades = state.trades.filter((t) => t.status === "completed").length;
  const pendingTrades = state.trades.filter((t) => t.status === "pending").length;
  const rep = completedTrades > 0 ? Math.min(100, Math.round((completedTrades / (completedTrades + pendingTrades)) * 100)) : 100;

  const insignias = [
    { id: 1, earned: totalCollected > 0, icon: <Award size={24} strokeWidth={2} />, title: "Primera postal" },
    { id: 2, earned: totalCollected >= 10, icon: <BadgeCheck size={24} strokeWidth={2} />, title: "10 postales" },
    { id: 3, earned: completedTrades >= 1, icon: <Handshake size={24} strokeWidth={2} />, title: "Primer intercambio" },
    { id: 4, earned: completedTrades >= 10, icon: <Star size={24} strokeWidth={2} />, title: "10 intercambios" },
    { id: 5, earned: totalCollected >= 50, icon: <Medal size={24} strokeWidth={2} />, title: "50 postales" },
    { id: 6, earned: pct >= 25, icon: <Award size={24} strokeWidth={2} />, title: "Álbum al 25%" },
    { id: 7, earned: pct >= 50, icon: <Crown size={24} strokeWidth={2} />, title: "Álbum al 50%" },
    { id: 8, earned: rep >= 100, icon: <Gem size={24} strokeWidth={2} />, title: "Reputación 100%" },
  ];

  const badgeTier = pct >= 75 ? "Coleccionista Platino" : pct >= 50 ? "Coleccionista Oro" : pct >= 25 ? "Coleccionista Plata" : "Coleccionista Bronce";

  return (
    <AppShell>
      <div className="flex items-center gap-6 mb-10 max-sm:flex-col max-sm:text-center">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-[linear-gradient(135deg,var(--color-accent),oklch(68%_0.16_68))] grid place-items-center text-white text-[32px] font-bold font-[var(--font-display)] shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            initials
          )}
        </div>
        <div>
          <h1 className="font-[var(--font-display)] text-[26px] font-bold">{displayName}</h1>
          <p className="text-sm text-[var(--color-muted)] mt-0.5">{userEmail}</p>
          <div className="flex gap-3 mt-2">
            <Pill variant="accent">{badgeTier}</Pill>
            {user && <Pill variant="field">Online</Pill>}
          </div>
        </div>
        <button
          onClick={signOut}
          className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-full border-[1.5px] border-[var(--color-border)] text-sm font-semibold text-[var(--color-fg)] cursor-pointer transition-colors hover:border-[var(--color-danger)] hover:text-[var(--color-danger)] max-sm:ml-0"
        >
          <LogOut size={14} /> Salir
        </button>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-12 max-sm:grid-cols-1">
        {/* Album summary */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 shadow-sm">
          <h3 className="text-[17px] font-bold font-[var(--font-display)] mb-4">Resumen del álbum</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-muted)]">Progreso total</span>
              <span className="font-semibold">{pct}% ({totalCollected} / {totalAll})</span>
            </div>
            <ProgressBar pct={pct} />
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-muted)]">Jugadores</span>
              <span className="font-semibold">{playerCollected} / {ALL_PLAYERS.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-muted)]">Estadios</span>
              <span className="font-semibold">{stadiumCollected} / {ALL_STADIUM_CARDS.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-muted)]">Sedes</span>
              <span className="font-semibold">{venueCollected} / {ALL_VENUE_CARDS.length}</span>
            </div>
          </div>
        </div>

        {/* Reputation */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 shadow-sm">
          <h3 className="text-[17px] font-bold font-[var(--font-display)] mb-4">Reputación de intercambio</h3>
          <div className="flex items-center gap-5">
            <div className="text-center">
              <div className="font-[var(--font-display)] text-[48px] font-bold text-[var(--color-accent)]">{rep}%</div>
              <div className="text-xs text-[var(--color-muted)]">Reputación</div>
            </div>
            <div className="flex-1 flex flex-col gap-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-muted)]">Intercambios completados</span>
                <span className="font-semibold">{completedTrades}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-muted)]">En curso</span>
                <span className="font-semibold">{pendingTrades}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-muted)]">Miembro desde</span>
                <span className="font-semibold">{createdAt}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Insignias */}
        <div className="col-span-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 shadow-sm">
          <h3 className="text-[17px] font-bold font-[var(--font-display)] mb-4">Insignias</h3>
          <div className="flex gap-3 flex-wrap">
            {insignias.map((ins) => (
              <div
                key={ins.id}
                title={ins.title}
                className={`w-[72px] h-[72px] rounded-full grid place-items-center border-2 transition-colors ${
                  ins.earned
                    ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] opacity-30"
                }`}
              >
                {ins.icon}
              </div>
            ))}
          </div>
        </div>

        {/* Trade history */}
        <div className="col-span-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 shadow-sm">
          <h3 className="text-[17px] font-bold font-[var(--font-display)] mb-4">Historial de intercambios</h3>
          {state.trades.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">Aún no has realizado intercambios.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {state.trades.map((trade) => (
                <div key={trade.id} className="flex items-center gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-3.5 px-[18px]">
                  <div className={`w-10 h-10 rounded-full grid place-items-center shrink-0 ${trade.direction === "sent" ? "bg-[var(--color-field-soft)] text-[var(--color-field)]" : "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"}`}>
                    {trade.direction === "sent" ? <Send size={18} strokeWidth={2} /> : <Inbox size={18} strokeWidth={2} />}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">
                      {trade.direction === "sent"
                        ? `Entregaste ${trade.offeredCardName} a ${trade.fromUser}`
                        : `Recibiste ${trade.cardName} de ${trade.fromUser}`}
                    </div>
                    <div className="text-xs text-[var(--color-muted)] mt-0.5">
                      {new Date(trade.date).toLocaleDateString("es-CR")} · {trade.direction === "sent" ? `Recibiste: ${trade.cardName}` : `Entregaste: ${trade.offeredCardName}`}
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    trade.status === "completed" ? "bg-[oklch(94%_0.06_156)] text-[var(--color-success)]" :
                    trade.status === "cancelled" ? "bg-[oklch(94%_0.05_22)] text-[var(--color-danger)]" :
                    "bg-[oklch(95%_0.06_72)] text-[var(--color-warning)]"
                  }`}>
                    {trade.status === "pending" ? "Pendiente" : trade.status === "completed" ? "Completado" : "Cancelado"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default function ProfilePage() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--color-accent)] border-t-transparent animate-spin" />
          <p className="text-sm text-[var(--color-muted)]">Cargando perfil...</p>
        </div>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
          <p className="text-[var(--color-muted)] mb-2">Iniciá sesión para ver tu perfil</p>
          <Link
            href="/login"
            className="px-6 py-2.5 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold no-underline hover:bg-[var(--color-accent-hover)]"
          >
            Iniciar sesión
          </Link>
        </div>
      </AppShell>
    );
  }

  return <ProfileContent />;
}
