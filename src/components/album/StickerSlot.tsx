"use client";

import Link from "next/link";
import { PositionSilhouette } from "./PositionSilhouette";

interface StickerSlotProps {
  id: string;
  collected: boolean;
  name?: string;
  num?: number;
  pos?: string;
  gradient?: string;
  albumNumber: number;
  teamName?: string;
  isSpecial?: boolean;
  faceUrl?: string;
}

export function StickerSlot({
  id,
  collected,
  name,
  num,
  pos,
  gradient,
  albumNumber,
  teamName,
  isSpecial,
  faceUrl,
}: StickerSlotProps) {
  if (collected && name) {
    return (
      <Link
        href={`/card/${id}`}
        aria-label={`Ver detalles de ${name}`}
        className="group relative aspect-[3/4] w-full block"
        title={`${name}${pos ? ` · ${pos}` : ""}${num ? ` · #${num}` : ""}`}
      >
        <div
          className="sticker-card absolute inset-0 rounded-[3px] overflow-hidden"
          style={{
            boxShadow: "0 1px 3px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
          }}
        >
          {/* Upper half: team gradient + silhouette */}
          <div
            className="relative h-[58%] flex items-center justify-center"
            style={{ background: `${gradient}, url('/card-bg.png') center/cover, ${gradient}`, backgroundBlendMode: "overlay" }}
          >
            {/* Watermark number */}
            {num && (
              <span className="absolute inset-0 flex items-center justify-center text-[64px] font-extrabold text-white/12 font-[var(--font-display)] select-none pointer-events-none">
                {num}
              </span>
            )}

            {/* Position silhouette or player face */}
            {faceUrl ? (
              <div className="w-[68%] h-[72%] relative z-[1] flex items-center justify-center">
                <img src={faceUrl} alt={name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
            ) : (
              <PositionSilhouette pos={pos || ""} className="w-[55%] h-[75%] relative z-[1]" />
            )}

            {/* Album number badge */}
            <span className="absolute top-1.5 left-1.5 bg-white/90 text-[10px] font-bold px-1.5 py-0.5 rounded-sm text-[var(--color-fg)] leading-none">
              {albumNumber}
            </span>

            {/* Special badge */}
            {isSpecial && (
              <span className="absolute top-1.5 right-1.5 bg-[var(--color-accent)] text-[9px] font-bold px-1.5 py-0.5 rounded-sm text-white leading-none">
                ★
              </span>
            )}
          </div>

          {/* Lower half: player info */}
          <div className="h-[42%] bg-[var(--color-surface)] flex flex-col items-center justify-center gap-0.5 px-2 border-t border-[var(--color-border)]/60">
            {num && (
              <span className="text-[11px] font-extrabold text-[var(--color-muted)] leading-none tracking-tight">
                {num}
              </span>
            )}
            <span className="text-[13px] font-bold text-[var(--color-fg)] leading-tight text-center line-clamp-2">
              {name}
            </span>
            {pos && (
              <span className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider leading-none">
                {pos}
              </span>
            )}
            {teamName && (
              <span className="text-[9px] text-[var(--color-muted)]/70 uppercase tracking-widest leading-none mt-0.5">
                {teamName}
              </span>
            )}
          </div>

          {/* Glossy shine overlay */}
          <div className="sticker-shine absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Link>
    );
  }

  // Empty slot
  return (
    <div className="relative aspect-[3/4] w-full">
      <div
        className="absolute inset-0 rounded-[3px] border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] flex flex-col items-center justify-center gap-1"
        style={{
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        {/* Faint silhouette placeholder */}
        <div className="w-[40%] h-[35%] flex items-center justify-center opacity-[0.06]">
          <PositionSilhouette pos={pos || ""} className="w-full h-full" />
        </div>

        {/* Slot number */}
        <span className="text-[28px] font-extrabold text-[var(--color-muted)]/15 font-[var(--font-display)] leading-none">
          {albumNumber}
        </span>

        {/* Subtle text */}
        <span className="text-[9px] text-[var(--color-muted)]/25 uppercase tracking-widest leading-none">
          sticker
        </span>
      </div>
    </div>
  );
}
