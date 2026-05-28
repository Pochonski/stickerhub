import type { ReactNode } from "react";
import { BindingEdge } from "./BindingEdge";

interface AlbumSpreadProps {
  leftPage: ReactNode;
  rightPage: ReactNode;
  leftPageNumber?: number;
  rightPageNumber?: number;
}

export function AlbumSpread({
  leftPage,
  rightPage,
  leftPageNumber,
  rightPageNumber,
}: AlbumSpreadProps) {
  return (
    <div className="album-spread relative flex max-lg:flex-col">
      {/* Left page */}
      <div className="album-page album-page-left relative flex-1 rounded-l-md max-lg:rounded-t-md max-lg:rounded-bl-none overflow-hidden">
        <img src="/fondo-izq.jpeg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none z-0" />

        {/* Binding edge */}
        <div className="relative z-[2]">
          <BindingEdge />
        </div>

        {/* Page content */}
        <div className="relative z-[1] pl-10 pr-6 py-8 max-sm:pl-8 max-sm:pr-4 max-sm:py-6">
          <div className="paper-texture absolute inset-0 pointer-events-none" />
          {leftPage}
        </div>

        {/* Page number */}
        {leftPageNumber && (
          <span className="absolute bottom-3 left-10 text-[10px] text-[var(--color-muted)]/40 font-medium tracking-wider max-sm:left-8">
            {leftPageNumber}
          </span>
        )}
      </div>

      {/* Center crease */}
      <div className="relative w-0 max-lg:hidden">
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[3px] bg-gradient-to-r from-black/6 via-black/3 to-transparent" />
        <div className="absolute inset-y-0 left-1/2 -translate-x-[3px] w-[3px] bg-gradient-to-l from-black/3 to-transparent" />
      </div>

      {/* Mobile separator */}
      <div className="hidden max-lg:block w-full h-[2px] bg-gradient-to-b from-black/5 to-transparent" />

      {/* Right page */}
      <div className="album-page album-page-right relative flex-1 rounded-r-md max-lg:rounded-b-md max-lg:rounded-tr-none overflow-hidden">
        <img src="/fondo-der.jpeg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none z-0" />

        {/* Page content */}
        <div className="relative z-[1] pl-6 pr-10 py-8 max-sm:pl-4 max-sm:pr-8 max-sm:py-6">
          <div className="paper-texture absolute inset-0 pointer-events-none" />
          {rightPage}
        </div>

        {/* Page number */}
        {rightPageNumber && (
          <span className="absolute bottom-3 right-10 text-[10px] text-[var(--color-muted)]/40 font-medium tracking-wider max-sm:right-8">
            {rightPageNumber}
          </span>
        )}
      </div>
    </div>
  );
}
