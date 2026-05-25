"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/album", label: "Colección" },
  { href: "/trading", label: "Intercambios" },
  { href: "/inbox", label: "Buzón" },
  { href: "/my-cards", label: "Mis Stickers" },
  { href: "/profile", label: "Perfil" },
  { href: "/discard", label: "Descartes" },
  { href: "/shop", label: "Tienda" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex gap-2">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-150 ${
              isActive
                ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                : "text-[var(--color-muted)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
