"use client";

import { useState, useEffect } from "react";
import { Search, Send, Inbox, Upload, X, Tag, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/components/auth/AuthProvider";
import { useGame } from "@/context/GameContext";
import { getSupabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/useToast";
import { ALL_PLAYERS } from "@/data/players";
import { ALL_STADIUM_CARDS, ALL_VENUE_CARDS } from "@/data/cards";
import { TEAMS, STADIUMS, VENUES } from "@/data/teams";

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

interface DupeInfo {
  id: string;
  name: string;
  teamId?: string;
  teamName?: string;
  teamColor?: string;
  teamColorDark?: string;
  faceUrl?: string;
  overall?: number;
  pos?: string;
  num?: number;
}

function getDupeInfo(id: string): DupeInfo | null {
  const p = ALL_PLAYERS.find((pl) => pl.id === id);
  if (p) {
    const t = TEAMS[p.teamId];
    return { id: p.id, name: p.name, teamId: p.teamId, teamName: t?.name, teamColor: t?.color, teamColorDark: t?.colorDark, faceUrl: p.faceUrl, overall: p.overall, pos: p.pos, num: p.num };
  }
  const s = ALL_STADIUM_CARDS.find((c) => c.id === id);
  if (s) {
    const t = STADIUMS[s.teamId];
    return { id: s.id, name: s.name, teamId: s.teamId, teamName: t?.name, teamColor: t?.color, teamColorDark: t?.colorDark };
  }
  const v = ALL_VENUE_CARDS.find((c) => c.id === id);
  if (v) {
    const t = VENUES[v.teamId];
    return { id: v.id, name: v.name, teamId: v.teamId, teamName: t?.name, teamColor: t?.color, teamColorDark: t?.colorDark };
  }
  return null;
}

const FILTER_TABS = [
  { id: "todos", label: "Todos" },
  { id: "jugadores", label: "Jugadores" },
  { id: "estadios", label: "Estadios" },
  { id: "sedes", label: "Sedes" },
];

export default function TradingPage() {
  const { user } = useAuth();
  const { state, requestTrade } = useGame();
  const { addToast } = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todos");
  const [sideSearch, setSideSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<{ name: string; owner: string; userId: string; listingId: string } | null>(null);
  const [offerCardId, setOfferCardId] = useState("");
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [myListings, setMyListings] = useState<ListingItem[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [loadingMyListings, setLoadingMyListings] = useState(false);
  const [publishModal, setPublishModal] = useState(false);
  const [publishCard, setPublishCard] = useState<{ id: string; name: string } | null>(null);
  const [lookingFor, setLookingFor] = useState("");
  const [section, setSection] = useState<"publish" | "mine" | "market">("publish");

  const handlePublish = async () => {
    if (!user || !publishCard) return;
    // Check if already published
    const alreadyPublished = myListings.some((l) => l.card_id === publishCard.id);
    if (alreadyPublished) {
      addToast("Esta carta ya está publicada", "warning");
      setPublishModal(false); setPublishCard(null);
      return;
    }
    const info = getDupeInfo(publishCard.id);
    const sb = getSupabase();
    const { error } = await sb.from("trade_listings").insert({
      user_id: user.id, card_id: publishCard.id, card_name: publishCard.name,
      team_name: info?.teamName || "", looking_for: lookingFor || null,
    });
    if (!error) {
      addToast(`¡${publishCard.name} publicada!`, "success");
      setPublishModal(false); setLookingFor(""); setPublishCard(null);
      fetchMyListings();
    } else {
      addToast("Error al publicar", "error");
    }
  };

  const handleUnpublish = async (listingId: string) => {
    const sb = getSupabase();
    await sb.from("trade_listings").update({ is_active: false, updated_at: new Date().toISOString() }).eq("id", listingId).eq("user_id", user!.id);
    setMyListings((prev) => prev.filter((l) => l.id !== listingId));
    addToast("Publicación eliminada", "success");
  };

  const fetchMyListings = async () => {
    if (!user) return;
    setLoadingMyListings(true);
    const sb = getSupabase();
    const { data } = await sb.from("trade_listings")
      .select("id, card_id, card_name, team_name, looking_for, created_at, user_id")
      .eq("is_active", true).eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setMyListings(data as ListingItem[]);
    setLoadingMyListings(false);
  };

  useEffect(() => {
    if (!user) return;
    setLoadingListings(true);
    const fetchListings = async () => {
      try {
        const sb = getSupabase();
        const { data } = await sb
          .from("trade_listings")
          .select("id, card_id, card_name, team_name, looking_for, created_at, user_id, profiles!inner(display_name, avatar_url, reputation, badge_tier)")
          .eq("is_active", true).neq("user_id", user.id)
          .order("created_at", { ascending: false }).limit(20);
        if (data) setListings(data as ListingItem[]);
      } catch {}
      finally { setLoadingListings(false); }
    };
    fetchListings();
    fetchMyListings();

    // Realtime: new listings appear automatically
    const sb2 = getSupabase();
    const channel = sb2
      .channel(`trading:${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "trade_listings" },
        (payload) => {
          const listing = payload.new as ListingItem;
          if (listing.user_id !== user.id) {
            setListings((prev) => [listing, ...prev]);
          } else {
            // My own new listing
            fetchMyListings();
          }
        })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "trade_listings", filter: `is_active=eq.false` },
        () => { fetchListings(); fetchMyListings(); })
      .subscribe();

    return () => { sb2.removeChannel(channel); };
  }, [user]);

  const dupes = state.duplicates.map((id) => getDupeInfo(id)).filter(Boolean) as DupeInfo[];
  const publishedIds = new Set(myListings.map((l) => l.card_id));
  const filteredDupes = sideSearch ? dupes.filter((d) => d.name.toLowerCase().includes(sideSearch.toLowerCase()) || d.teamName?.toLowerCase().includes(sideSearch.toLowerCase())) : dupes;

  const duplicateNames = dupes.map((d) => ({ id: d.id, name: d.name }));

  const filtered = listings.filter((t) => {
    if (search && !t.card_name.toLowerCase().includes(search.toLowerCase()) && !t.team_name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openExchange = (listing: ListingItem) => {
    setSelectedTrade({ name: listing.card_name, owner: listing.profiles?.[0]?.display_name || "Anónimo", userId: listing.user_id, listingId: listing.id });
    setOfferCardId(duplicateNames[0]?.id || "");
    setModalOpen(true);
  };

  const confirmExchange = () => {
    if (!selectedTrade || !offerCardId) return;
    const offered = duplicateNames.find((d) => d.id === offerCardId);
    requestTrade(selectedTrade.listingId, selectedTrade.name, selectedTrade.userId, offerCardId, offered?.name || offerCardId, selectedTrade.listingId);
    addToast("Solicitud enviada", "success");
    setModalOpen(false);
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-[var(--font-display)] text-[28px] font-bold tracking-tight">Intercambios</h1>
        <div className="flex items-center gap-3 text-sm text-[var(--color-muted)]">
          <span className="flex items-center gap-1"><Tag size={14} /> {dupes.length} repetidas</span>
          <span className="flex items-center gap-1"><Users size={14} /> {state.trades.filter((t) => t.status === "pending").length} activos</span>
        </div>
      </div>
      <p className="text-[var(--color-muted)] text-[15px] mb-6">Publicá tus repetidas y encontrá las que te faltan.</p>

      {/* Section tabs */}
      <div className="flex gap-1 bg-[var(--color-border)] p-1 rounded-full w-fit mb-8">
        {[
          { id: "publish" as const, label: "Publicar", icon: <Upload size={14} />, count: dupes.length },
          { id: "mine" as const, label: "Mis activas", icon: <Send size={14} />, count: myListings.length },
          { id: "market" as const, label: "Marketplace", icon: <Users size={14} />, count: listings.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSection(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer border-none ${
              section === tab.id
                ? "bg-[var(--color-surface)] text-[var(--color-fg)] shadow-sm"
                : "bg-transparent text-[var(--color-muted)] hover:text-[var(--color-fg)]"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-0.5 text-[10px] font-bold bg-[var(--color-accent-soft)] text-[var(--color-accent)] px-1.5 py-0.5 rounded-full">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* PUBLICAR MIS REPETIDAS */}
      {section === "publish" && (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-[var(--font-display)] text-lg font-bold flex items-center gap-2"><Upload size={18} className="text-[var(--color-primary)]" /> Publicar mis repetidas</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
              <input
                type="text" placeholder="Filtrar mis repetidas..." value={sideSearch}
                onChange={(e) => setSideSearch(e.target.value)}
                className="w-[200px] pl-8 pr-3 py-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] text-xs outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            <span className="text-xs text-[var(--color-muted)]">{filteredDupes.length} / {dupes.length}</span>
        </div>
      </div>

        {dupes.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)] text-center py-6">No tenés repetidas. ¡Abrí sobres para conseguir!</p>
        ) : filteredDupes.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)] text-center py-6">Ninguna repetida coincide con el filtro.</p>
        ) : (
          <div className="grid grid-cols-4 gap-3 max-lg:grid-cols-3 max-sm:grid-cols-2">
            {filteredDupes.map((d) => (
              <div key={d.id} className="group relative bg-[var(--color-bg)] rounded-lg overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-primary)]/40 transition-all">
                <div className="aspect-[3/4] relative">
                  <div className="w-full h-[58%] flex items-center justify-center relative" style={{ background: d.teamColor ? `linear-gradient(180deg, ${d.teamColor} 0%, ${d.teamColorDark} 100%)` : "oklch(72% 0.1 250)" }}>
                    {d.faceUrl ? (
                      <img src={d.faceUrl} alt={d.name} className="w-[60%] h-[70%] object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-lg font-extrabold text-white/20">{d.name.slice(0, 2).toUpperCase()}</span>
                    )}
                    {d.overall && (
                      <span className="absolute top-1.5 right-1.5 bg-[var(--color-accent)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm leading-none">{d.overall}</span>
                    )}
                  </div>
                  <div className="h-[42%] bg-white/90 p-2 flex flex-col justify-center text-center">
                    <span className="text-[12px] font-bold leading-tight">{d.name}</span>
                    {d.teamName && <span className="text-[10px] text-[var(--color-muted)] mt-0.5 truncate">{d.teamName}{d.num ? ` · #${d.num}` : ""}</span>}
                  </div>
                </div>
                {publishedIds.has(d.id) ? (
                  <div className="absolute top-1.5 right-1.5 bg-[var(--color-success)]/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">Publicada</div>
                ) : (
                  <button
                    onClick={() => { setPublishCard({ id: d.id, name: d.name }); setLookingFor(""); setPublishModal(true); }}
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-black/40"
                  >
                    <span className="px-4 py-2 rounded-full bg-[var(--color-primary)] text-white text-sm font-semibold">Publicar</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* MIS PUBLICACIONES ACTIVAS */}
      {section === "mine" && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 mb-8">
          <h2 className="font-[var(--font-display)] text-lg font-bold mb-4 flex items-center gap-2"><Send size={18} className="text-[var(--color-accent)]" /> Mis publicaciones activas</h2>
          {loadingMyListings && <p className="text-sm text-[var(--color-muted)] text-center py-4">Cargando...</p>}
          {!loadingMyListings && myListings.length === 0 && <p className="text-sm text-[var(--color-muted)] text-center py-6">No tenés publicaciones activas.</p>}
          {!loadingMyListings && myListings.length > 0 && (
            <div className="flex flex-col gap-2">
              {myListings.map((ml) => {
                const info = getDupeInfo(ml.card_id);
                return (
                  <div key={ml.id} className="flex items-center gap-3 p-3 bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)] max-sm:flex-col max-sm:items-start">
                    <div className="w-[44px] h-[58px] rounded overflow-hidden shrink-0 flex items-center justify-center relative" style={{ background: info?.teamColor ? `linear-gradient(180deg, ${info.teamColor} 0%, ${info.teamColorDark} 100%)` : "oklch(72% 0.1 250)" }}>
                      {info?.faceUrl ? (
                        <img src={info.faceUrl} alt={ml.card_name} className="w-[60%] h-[60%] object-contain" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-xs font-extrabold text-white/25">{ml.card_name.slice(0, 2)}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-sm">{ml.card_name}</span>
                      {ml.looking_for && <span className="text-xs text-[var(--color-muted)] ml-2">Busca: {ml.looking_for}</span>}
                    </div>
                    <span className="text-[10px] text-[var(--color-muted)]">{new Date(ml.created_at).toLocaleDateString("es-CR")}</span>
                    <button onClick={() => handleUnpublish(ml.id)} className="px-3 py-1 rounded-full bg-[var(--color-danger)]/10 text-[var(--color-danger)] text-[11px] font-semibold cursor-pointer border-none hover:bg-[var(--color-danger)]/20">
                      <X size={12} className="inline mr-1" />Quitar
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MARKETPLACE */}
      {section === "market" && (
      <div>
        <h2 className="font-[var(--font-display)] text-lg font-bold mb-4">Marketplace</h2>
        <div className="flex gap-2 flex-wrap mb-5">
          {FILTER_TABS.map((f) => (
            <button
              key={f.id} onClick={() => setFilter(f.id)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-medium cursor-pointer border-[1.5px] transition-colors ${
                filter === f.id ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white" : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-full mb-6">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            type="text" placeholder="Buscar por nombre, equipo..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 rounded-full border-[1.5px] border-[var(--color-border)] bg-[var(--color-surface)] text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
          />
        </div>

        <div className="flex flex-col gap-3">
          {loadingListings ? (
            <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
              {[1,2,3].map((i) => (
                <div key={i} className="h-[100px] rounded-lg bg-[var(--color-border)] animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)] text-center py-8">{user ? "No hay publicaciones. ¡Publicá vos la primera!" : "Iniciá sesión para ver publicaciones."}</p>
          ) : (
            filtered.map((listing) => {
              const info = getDupeInfo(listing.card_id);
              return (
                <div key={listing.id} className="flex items-center gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 transition-shadow hover:shadow-md max-sm:flex-col max-sm:items-start max-sm:gap-3">
                  <div className="w-[60px] h-[80px] rounded-lg overflow-hidden shrink-0 flex items-center justify-center relative" style={{ background: info?.teamColor ? `linear-gradient(180deg, ${info.teamColor} 0%, ${info.teamColorDark} 100%)` : "oklch(72% 0.1 250)" }}>
                    {info?.faceUrl ? (
                      <img src={info.faceUrl} alt={listing.card_name} className="w-[65%] h-[65%] object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-sm font-extrabold text-white/25">{listing.card_name.slice(0, 2).toUpperCase()}</span>
                    )}
                    {info?.overall && (
                      <span className="absolute bottom-1 right-1 bg-[var(--color-accent)] text-white text-[9px] font-bold px-1 rounded-sm">{info.overall}</span>
                    )}
                  </div>
                  <div className="flex-1 max-sm:w-full">
                    <div className="font-bold text-[15px]">{listing.card_name}</div>
                    <div className="text-[13px] text-[var(--color-muted)]">{listing.team_name || info?.teamName || "—"}</div>
                    {listing.looking_for && <div className="text-xs text-[var(--color-muted)] mt-0.5">Busca: {listing.looking_for}</div>}
                    <div className="text-xs text-[var(--color-muted)] mt-1">
                      {listing.profiles?.[0]?.display_name || "Anónimo"} · {listing.profiles?.[0]?.reputation || 100}% rep
                    </div>
                  </div>
                  <button onClick={() => openExchange(listing)} className="px-5 py-2.5 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold cursor-pointer border-none transition-colors hover:bg-[var(--color-accent-hover)] max-sm:w-full">
                    Solicitar
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
      )}

      {/* Trade request modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <h3 className="text-xl font-bold font-[var(--font-display)] mb-2">Solicitar intercambio</h3>
        <p className="text-sm text-[var(--color-muted)] mb-5">Estás solicitando <strong>{selectedTrade?.name}</strong> de <strong>{selectedTrade?.owner}</strong>.</p>
        <label className="text-[13px] font-semibold block mb-1.5">Ofrecer a cambio:</label>
        <select value={offerCardId} onChange={(e) => setOfferCardId(e.target.value)} className="w-full px-3.5 py-2.5 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-border)] text-sm bg-[var(--color-bg)] mb-5">
          {duplicateNames.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <div className="flex gap-2.5 justify-end">
          <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-full bg-transparent text-[var(--color-muted)] text-sm font-semibold cursor-pointer border-none hover:bg-[var(--color-accent-soft)]">Cancelar</button>
          <button onClick={confirmExchange} className="px-5 py-2.5 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold cursor-pointer border-none hover:bg-[var(--color-accent-hover)]">Enviar solicitud</button>
        </div>
      </Modal>

      {/* Publish modal */}
      <Modal open={publishModal} onClose={() => setPublishModal(false)}>
        <h3 className="text-xl font-bold font-[var(--font-display)] mb-2">Publicar para intercambiar</h3>
        <p className="text-sm text-[var(--color-muted)] mb-4">Estás publicando <strong>{publishCard?.name}</strong> para que otros te puedan solicitar un intercambio.</p>
        <label className="text-[13px] font-semibold block mb-1.5">¿Qué buscás a cambio? (opcional)</label>
        <input
          type="text" placeholder='Ej: "Cualquier carta de Argentina"' value={lookingFor}
          onChange={(e) => setLookingFor(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-border)] text-sm bg-[var(--color-bg)] mb-5 outline-none focus:border-[var(--color-accent)]"
        />
        <div className="flex gap-2.5 justify-end">
          <button onClick={() => setPublishModal(false)} className="px-5 py-2.5 rounded-full bg-transparent text-[var(--color-muted)] text-sm font-semibold cursor-pointer border-none hover:bg-[var(--color-accent-soft)]">Cancelar</button>
          <button onClick={handlePublish} className="px-5 py-2.5 rounded-full bg-[var(--color-primary)] text-white text-sm font-semibold cursor-pointer border-none hover:bg-[var(--color-primary-hover)]">Publicar</button>
        </div>
      </Modal>
    </AppShell>
  );
}
