"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Pill } from "@/components/ui/Pill";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/components/auth/AuthProvider";
import { useGame } from "@/context/GameContext";
import { getSupabase } from "@/lib/supabase/client";
import { ALL_PLAYERS } from "@/data/players";
import { Search, Send, Inbox } from "lucide-react";

interface ListingItem {
  id: string;
  card_id: string;
  card_name: string;
  team_name: string;
  looking_for: string;
  created_at: string;
  user_id: string;
  profiles: Array<{
    display_name: string;
    avatar_url: string;
    reputation: number;
    badge_tier: string;
  }> | null;
}


export default function TradingPage() {
  const { user } = useAuth();
  const { state, requestTrade } = useGame();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<{ name: string; owner: string; userId: string; listingId: string } | null>(null);
  const [offerCardId, setOfferCardId] = useState("");
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);

  // Fetch real listings when authenticated
  useEffect(() => {
    if (!user) return;
    setLoadingListings(true);
    const fetchListings = async () => {
      try {
        const sb = getSupabase();
        const { data } = await sb
          .from("trade_listings")
          .select("id, card_id, card_name, team_name, looking_for, created_at, user_id, profiles!inner(display_name, avatar_url, reputation, badge_tier)")
          .eq("is_active", true)
          .neq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);
        if (data) setListings(data as ListingItem[]);
      } catch {
        // Auth not ready or network error
      } finally {
        setLoadingListings(false);
      }
    };
    fetchListings();
  }, [user]);

  const duplicates = state.duplicates;
  const duplicateNames = duplicates.map((id) => {
    const p = ALL_PLAYERS.find((pl) => pl.id === id);
    return p ? { id: p.id, name: `${p.name} (${p.teamId.toUpperCase()})` } : { id, name: id };
  });

  const filtered = listings.filter((t) =>
    search ? t.card_name.toLowerCase().includes(search.toLowerCase()) || t.team_name?.toLowerCase().includes(search.toLowerCase()) : true
  );

  const openExchange = (listing: ListingItem) => {
    setSelectedTrade({
      name: listing.card_name,
      owner: listing.profiles?.[0]?.display_name || "Anónimo",
      userId: listing.user_id,
      listingId: listing.id,
    });
    setOfferCardId(duplicateNames[0]?.id || "");
    setModalOpen(true);
  };

  const confirmExchange = () => {
    if (!selectedTrade || !offerCardId) return;
    const offered = duplicateNames.find((d) => d.id === offerCardId);
    requestTrade(
      selectedTrade.listingId,
      selectedTrade.name,
      selectedTrade.userId,
      offerCardId,
      offered?.name || offerCardId,
      selectedTrade.listingId
    );
    addToast("Solicitud enviada", "success");
    setModalOpen(false);
  };

  return (
    <AppShell>
      <h1 className="font-[var(--font-display)] text-[28px] font-bold tracking-tight mb-2">Intercambios</h1>
      <p className="text-[var(--color-muted)] text-[15px] mb-8">Encuentra las postales que te faltan y ofrece tus repetidas a otros coleccionistas.</p>

      <div className="grid grid-cols-[1fr_340px] gap-8 mb-16 max-lg:grid-cols-1">
        {/* Main list */}
        <div>
          <div className="flex gap-2.5 flex-wrap mb-5">
            {["todos", "jugadores", "estadios", "recientes"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-[13px] font-medium cursor-pointer border-[1.5px] transition-colors ${
                  filter === f
                    ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white"
                    : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                }`}
              >
                {f === "todos" ? "Todos" : f === "jugadores" ? "Jugadores" : f === "estadios" ? "Estadios" : "Más recientes"}
              </button>
            ))}
          </div>

          <div className="relative max-w-full mb-6">
            <label className="sr-only" htmlFor="trading-search">Buscar postal</label>
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" aria-hidden="true">
              <Search size={16} strokeWidth={2} />
            </span>
            <input
              id="trading-search"
              type="text"
              placeholder="Buscar por nombre, equipo o país..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-full border-[1.5px] border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-fg)] transition-colors focus:border-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            />
          </div>

          <div className="flex flex-col gap-3.5">
            {loadingListings ? (
              <p className="text-sm text-[var(--color-muted)] text-center py-8">Cargando publicaciones...</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)] text-center py-8">
                {user ? "Nadie ha publicado stickers todavía. ¡Sé el primero!" : "Iniciá sesión para ver publicaciones de intercambio."}
              </p>
            ) : (
              filtered.map((listing) => (
                <div key={listing.id} className="flex items-center gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 px-5 transition-shadow hover:shadow-md max-sm:flex-col max-sm:items-start max-sm:gap-3">
                  <div className="w-16 h-[84px] rounded-lg overflow-hidden shrink-0 bg-[linear-gradient(180deg,oklch(72%_0.1_250),oklch(58%_0.12_250))] flex items-center justify-center text-white text-xs font-bold">
                    {listing.card_name.slice(0, 2)}
                  </div>
                  <div className="flex-1 max-sm:w-full">
                    <div className="font-bold text-[15px] mb-0.5">{listing.card_name}</div>
                    <div className="text-[13px] text-[var(--color-muted)]">{listing.team_name || "—"}</div>
                    {listing.looking_for && (
                      <div className="text-xs text-[var(--color-muted)] mt-0.5">Busca: {listing.looking_for}</div>
                    )}
                    <div className="text-xs text-[var(--color-muted)] flex items-center gap-1.5 mt-1">
                      <span className="w-5 h-5 rounded-full bg-[var(--color-border)]" />
                      {listing.profiles?.[0]?.display_name || "Anónimo"} · {listing.profiles?.[0]?.reputation || 100}%
                    </div>
                  </div>
                  <button
                    onClick={() => openExchange(listing)}
                    className="px-[22px] py-2.5 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold cursor-pointer border-none transition-colors hover:bg-[var(--color-accent-hover)] max-sm:w-full"
                  >
                    Solicitar intercambio
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 h-fit sticky top-6 max-lg:static">
          <h3 className="text-[17px] font-bold font-[var(--font-display)] mb-4">Mis repetidas disponibles</h3>
          {duplicateNames.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">No tienes postales repetidas para intercambiar.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {duplicateNames.map((d) => (
                <div key={d.id} className="flex items-center gap-3 py-2 border-b border-[var(--color-border)] last:border-b-0">
                  <div className="w-10 h-[52px] rounded shrink-0" style={{ background: "linear-gradient(180deg, oklch(72% 0.1 250) 0%, oklch(58% 0.12 250) 50%, oklch(95% 0.02 250) 50%, oklch(90% 0.03 250) 100%)" }} />
                  <div className="flex-1 text-[13px] font-semibold">{d.name}</div>
                  <Pill variant="warning">Repetida</Pill>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 space-y-2.5">
            <div className="flex justify-between py-2.5 border-b border-[var(--color-border)] text-sm">
              <span className="text-[var(--color-muted)]">Repetidas</span>
              <span className="font-semibold">{duplicates.length}</span>
            </div>
            <div className="flex justify-between py-2.5 text-sm">
              <span className="text-[var(--color-muted)]">Intercambios activos</span>
              <span className="font-semibold">{state.trades.filter((t) => t.status === "pending").length}</span>
            </div>
          </div>
        </aside>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <h3 className="text-xl font-bold font-[var(--font-display)] mb-2">Solicitar intercambio</h3>
        <p className="text-sm text-[var(--color-muted)] mb-5">
          Estás solicitando un intercambio por la postal de <strong>{selectedTrade?.name}</strong> de <strong>{selectedTrade?.owner}</strong>.
        </p>
        <label className="text-[13px] font-semibold block mb-1.5">Ofrecer a cambio:</label>
        <select
          value={offerCardId}
          onChange={(e) => setOfferCardId(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-border)] text-sm bg-[var(--color-bg)] mb-5"
        >
          {duplicateNames.map((d) => (
            <option key={d.id} value={d.id}>{d.name} — Repetida</option>
          ))}
        </select>
        <div className="flex gap-2.5 justify-end">
          <button
            onClick={() => setModalOpen(false)}
            className="px-[22px] py-2.5 rounded-full bg-transparent text-[var(--color-muted)] text-sm font-semibold cursor-pointer border-none transition-colors hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)]"
          >
            Cancelar
          </button>
          <button
            onClick={confirmExchange}
            className="px-[22px] py-2.5 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold cursor-pointer border-none transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            Enviar solicitud
          </button>
        </div>
      </Modal>
    </AppShell>
  );
}
