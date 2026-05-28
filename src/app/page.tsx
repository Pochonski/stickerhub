"use client";

import Link from "next/link";
import { AppShell } from "@/presentation/components/layout/AppShell";
import { useGame } from "@/presentation/contexts/GameContext";
import { BookOpen, ArrowRightLeft, WalletCards, User, PackageOpen } from "lucide-react";

const iconClass = "size-12 text-white/80";

export default function Home() {
  const { state } = useGame();

  return (
    <AppShell>
      <div className="text-center py-16 px-6">
        <h1 className="font-[var(--font-display)] text-[clamp(32px,5vw,48px)] font-extrabold tracking-tight bg-[linear-gradient(135deg,var(--color-accent),oklch(68%_0.16_68),var(--color-accent-hover))] bg-clip-text text-transparent">
          Sticker<span className="text-[var(--color-primary)]">Hub</span> FIFA
        </h1>
        <p className="text-[var(--color-muted)] text-lg max-w-[520px] mx-auto mt-3">
          Colecciona las postales de cada selección, estadio y sede del Mundial. Intercambia tus repetidas y descubre contenido exclusivo de cada jugador.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6 pb-16 max-sm:grid-cols-1">
        <Link
          href="/album"
          className="flex flex-col no-underline text-[var(--color-fg)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden transition-all duration-150 hover:shadow-lg hover:border-[var(--color-accent)]/30"
        >
          <div className="aspect-[16/10] grid place-items-center bg-[linear-gradient(135deg,oklch(85%_0.12_68),oklch(70%_0.13_68),oklch(55%_0.09_68))]">
            <BookOpen className={iconClass} strokeWidth={1.5} />
          </div>
          <div className="p-4 flex flex-col flex-1">
            <h3 className="text-[17px] font-bold font-[var(--font-display)] mb-1">Colección</h3>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed flex-1">Explora las selecciones: cada equipo tiene su página con los stickers que tenés y los que te faltan.</p>
            <span className="inline-flex items-center gap-1.5 mt-3.5 text-sm font-semibold text-[var(--color-accent)]">Abrir colección &rarr;</span>
          </div>
        </Link>

        <Link
          href="/trading"
          className="flex flex-col no-underline text-[var(--color-fg)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden transition-all duration-150 hover:shadow-lg hover:border-[var(--color-accent)]/30"
        >
          <div className="aspect-[16/10] grid place-items-center bg-[linear-gradient(135deg,oklch(90%_0.06_240),oklch(80%_0.04_240),oklch(92%_0.02_240))]">
            <ArrowRightLeft className={iconClass} strokeWidth={1.5} />
          </div>
          <div className="p-4 flex flex-col flex-1">
            <h3 className="text-[17px] font-bold font-[var(--font-display)] mb-1">Intercambios</h3>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed flex-1">Publica tus repetidas y encuentra las postales que te faltan. Solicita intercambios seguros con otros coleccionistas.</p>
            <span className="inline-flex items-center gap-1.5 mt-3.5 text-sm font-semibold text-[var(--color-accent)]">Ir a intercambios &rarr;</span>
          </div>
        </Link>

        <Link
          href="/my-cards"
          className="flex flex-col no-underline text-[var(--color-fg)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden transition-all duration-150 hover:shadow-lg hover:border-[var(--color-accent)]/30"
        >
          <div className="aspect-[16/10] grid place-items-center bg-[linear-gradient(135deg,oklch(80%_0.08_142),oklch(70%_0.1_142),oklch(60%_0.09_142))]">
            <WalletCards className={iconClass} strokeWidth={1.5} />
          </div>
          <div className="p-4 flex flex-col flex-1">
            <h3 className="text-[17px] font-bold font-[var(--font-display)] mb-1">Mis Stickers</h3>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed flex-1">Tu colección personal: postales obtenidas, repetidas, favoritas. Gestiona tu inventario para intercambios.</p>
            <span className="inline-flex items-center gap-1.5 mt-3.5 text-sm font-semibold text-[var(--color-accent)]">Ver colección &rarr;</span>
          </div>
        </Link>

        <Link
          href="/profile"
          className="flex flex-col no-underline text-[var(--color-fg)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden transition-all duration-150 hover:shadow-lg hover:border-[var(--color-accent)]/30"
        >
          <div className="aspect-[16/10] grid place-items-center bg-[linear-gradient(135deg,oklch(85%_0.04_280),oklch(75%_0.06_280),oklch(65%_0.05_280))]">
            <User className={iconClass} strokeWidth={1.5} />
          </div>
          <div className="p-4 flex flex-col flex-1">
            <h3 className="text-[17px] font-bold font-[var(--font-display)] mb-1">Perfil</h3>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed flex-1">Tu reputación como coleccionista, historial de intercambios, insignias ganadas y progreso general del álbum.</p>
            <span className="inline-flex items-center gap-1.5 mt-3.5 text-sm font-semibold text-[var(--color-accent)]">Ver perfil &rarr;</span>
          </div>
        </Link>

        <Link
          href="/pack-opener"
          className="flex flex-col no-underline text-[var(--color-fg)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden transition-all duration-150 hover:shadow-lg hover:border-[var(--color-accent)]/30"
        >
          <div className="aspect-[16/10] grid place-items-center bg-[linear-gradient(135deg,oklch(35%_0.04_260),oklch(22%_0.03_260),oklch(30%_0.03_260))] border-2 border-[var(--color-accent)]">
            <PackageOpen className="size-12 text-[var(--color-accent)]" strokeWidth={1.5} />
          </div>
          <div className="p-4 flex flex-col flex-1">
            <h3 className="text-[17px] font-bold font-[var(--font-display)] mb-1">Abrir sobres</h3>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed flex-1">
              Abre un sobre y descubre 7 postales al azar de jugadores, estadios o sedes. ({state.packs} disponibles)
            </p>
            <span className="inline-flex items-center gap-1.5 mt-3.5 text-sm font-semibold text-[var(--color-accent)]">Abrir sobre &rarr;</span>
          </div>
        </Link>
      </div>
    </AppShell>
  );
}
