import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "StickerHub — Mundial FIFA",
  description: "Coleccioná stickers de las 48 selecciones del Mundial FIFA 2026. Abrí sobres, intercambiá con amigos y completá tu colección.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-[var(--color-primary)] focus:text-white focus:rounded-full focus:outline-none">
          Saltar al contenido
        </a>
        <div id="main">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
