"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ArrowRightLeft, WalletCards, Store, User, PackageOpen, Trash2, Inbox, Ellipsis } from "lucide-react";
import { useGame } from "@/presentation/contexts/GameContext";
import { useState } from "react";

const MAIN_ITEMS = [
  { href: "/album", label: "Colección", icon: BookOpen },
  { href: "/trading", label: "Intercambios", icon: ArrowRightLeft },
  { href: "/my-cards", label: "Stickers", icon: WalletCards },
  { href: "/shop", label: "Tienda", icon: Store },
  { href: "/profile", label: "Perfil", icon: User },
];

const MORE_ITEMS = [
  { href: "/pack-opener", label: "Sobres", icon: PackageOpen },
  { href: "/inbox", label: "Buzón", icon: Inbox },
  { href: "/discard", label: "Descartes", icon: Trash2 },
];

export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const { state } = useGame();
  const pendingTrades = state.trades.filter((t) => t.status === "pending").length;

  return (
    <>
      {/* Backdrop for "More" menu */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* "More" slide-up menu */}
      <div
        className={`fixed bottom-16 left-0 right-0 z-40 bg-[var(--color-surface)] border-t border-[var(--color-border)] rounded-t-2xl shadow-lg px-4 py-3 transition-all duration-200 md:hidden safe-area-bottom ${
          moreOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex justify-around">
          {MORE_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className={`flex flex-col items-center justify-center gap-1 px-5 py-2 rounded-xl transition-colors no-underline h-full ${
                  isActive
                    ? "text-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                    : "text-[var(--color-muted)] hover:text-[var(--color-accent)]"
                }`}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[11px] font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-surface)]/95 backdrop-blur-md border-t border-[var(--color-border)] md:hidden safe-area-bottom">
        <div className="flex justify-around items-center h-16 max-w-[1200px] mx-auto px-1">
          {MAIN_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href) || (item.href === "/album" && pathname === "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center gap-0.5 px-2 h-full rounded-xl transition-colors no-underline min-w-0 ${
                  isActive
                    ? "text-[var(--color-accent)]"
                    : "text-[var(--color-muted)] hover:text-[var(--color-fg)]"
                }`}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[10px] font-semibold truncate max-w-[56px]">{item.label}</span>
                {item.href === "/trading" && pendingTrades > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--color-danger)] border-2 border-[var(--color-surface)]" />
                )}
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={`relative flex flex-col items-center justify-center gap-0.5 px-2 h-full rounded-xl transition-colors bg-transparent border-none cursor-pointer ${
              moreOpen
                ? "text-[var(--color-accent)]"
                : "text-[var(--color-muted)] hover:text-[var(--color-fg)]"
            }`}
            aria-label="Más opciones"
            aria-expanded={moreOpen}
          >
            <Ellipsis size={22} strokeWidth={moreOpen ? 2.5 : 1.8} />
            <span className="text-[10px] font-semibold">Más</span>
          </button>
        </div>
      </nav>
    </>
  );
}
