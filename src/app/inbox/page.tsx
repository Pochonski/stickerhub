"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/components/auth/AuthProvider";
import { useGame } from "@/context/GameContext";
import { useToast } from "@/hooks/useToast";
import { getSupabase } from "@/lib/supabase/client";
import { ALL_PLAYERS } from "@/data/players";
import { TEAMS } from "@/data/teams";
import { Check, X, Send, Inbox, Clock, Loader2 } from "lucide-react";

interface TradeItem {
  id: string;
  from_user_id: string;
  to_user_id: string;
  listing_id: string;
  requested_card_id: string;
  requested_card_name: string;
  offered_card_id: string;
  offered_card_name: string;
  status: string;
  created_at: string;
  from_user?: { display_name: string }[];
  to_user?: { display_name: string }[];
}

export default function InboxPage() {
  const { user } = useAuth();
  const { state, completeTrade, cancelTrade, isCollected } = useGame();
  const { addToast } = useToast();
  const [tab, setTab] = useState<"received" | "sent">("received");
  const [trades, setTrades] = useState<TradeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const fetchTrades = async () => {
      try {
        const sb = getSupabase();
        const { data } = await sb.from("trade_offers")
          .select("*, from_user:profiles!trade_offers_from_user_id_fkey(display_name), to_user:profiles!trade_offers_to_user_id_fkey(display_name)")
          .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
          .order("created_at", { ascending: false });
        if (data) setTrades(data as TradeItem[]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrades();
  }, [user]);

  const handleAccept = async (trade: TradeItem) => {
    const sb = getSupabase();
    // Transfer offered card (from initiator) to recipient
    const { error: removeOffered } = await sb.from("user_collections").delete()
      .eq("user_id", trade.from_user_id).eq("card_id", trade.offered_card_id).eq("is_duplicate", true);
    if (removeOffered) { addToast("Error al transferir", "error"); return; }

    await sb.from("user_collections").upsert(
      { user_id: user!.id, card_id: trade.offered_card_id, is_duplicate: false, source: "trade", collected_at: new Date().toISOString() },
      { onConflict: "user_id, card_id, is_duplicate" }
    );

    // Transfer requested card (from recipient) to initiator
    const { error: removeReq } = await sb.from("user_collections").delete()
      .eq("user_id", user!.id).eq("card_id", trade.requested_card_id).eq("is_duplicate", true);
    if (removeReq) { addToast("Error al transferir", "error"); return; }

    await sb.from("user_collections").upsert(
      { user_id: trade.from_user_id, card_id: trade.requested_card_id, is_duplicate: false, source: "trade", collected_at: new Date().toISOString() },
      { onConflict: "user_id, card_id, is_duplicate" }
    );

    await sb.from("trade_offers").update({ status: "completed", completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", trade.id);
    if (trade.listing_id) {
      await sb.from("trade_listings").update({ is_active: false, updated_at: new Date().toISOString() }).eq("id", trade.listing_id);
    }

    await sb.from("notifications").insert({
      user_id: trade.from_user_id, type: "trade_completed",
      title: "Intercambio completado", body: `Recibiste ${trade.requested_card_name}`,
    });

    try { await sb.rpc("increment_reputation", { user_id: trade.from_user_id }); } catch {}
    try { await sb.rpc("increment_reputation", { user_id: user!.id }); } catch {}

    setTrades((prev) => prev.map((t) => t.id === trade.id ? { ...t, status: "completed" } : t));
    completeTrade(trade.id);
    addToast("¡Intercambio aceptado! Cartas transferidas.", "success");
  };

  const handleReject = async (trade: TradeItem) => {
    const sb = getSupabase();
    await sb.from("trade_offers").update({ status: "rejected", updated_at: new Date().toISOString() }).eq("id", trade.id).eq("to_user_id", user!.id);
    await sb.from("notifications").insert({
      user_id: trade.from_user_id, type: "trade_rejected",
      title: "Intercambio rechazado", body: `Tu oferta de ${trade.offered_card_name} fue rechazada`,
    });
    setTrades((prev) => prev.map((t) => t.id === trade.id ? { ...t, status: "rejected" } : t));
    addToast("Intercambio rechazado", "warning");
  };

  const handleCancel = async (trade: TradeItem) => {
    const sb = getSupabase();
    await sb.from("trade_offers").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", trade.id).eq("from_user_id", user!.id);
    setTrades((prev) => prev.map((t) => t.id === trade.id ? { ...t, status: "cancelled" } : t));
    cancelTrade(trade.id);
    addToast("Intercambio cancelado", "warning");
  };

  const filteredTrades = trades.filter((t) =>
    tab === "received" ? t.to_user_id === user?.id : t.from_user_id === user?.id
  );

  return (
    <AppShell>
      <h1 className="font-[var(--font-display)] text-[28px] font-bold tracking-tight mb-2">Buzón</h1>
      <p className="text-[var(--color-muted)] text-[15px] mb-6">Gestioná tus solicitudes de intercambio.</p>

      <div className="flex gap-2 mb-6">
        {(["received", "sent"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full text-sm font-semibold cursor-pointer border-none transition-colors ${
              tab === t ? "bg-[var(--color-accent)] text-white" : "bg-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-accent-soft)]"
            }`}
          >
            {t === "received" ? <>📨 Recibidos</> : <>📤 Enviados</>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-[var(--color-muted)]" /></div>
      ) : filteredTrades.length === 0 ? (
        <p className="text-center text-[var(--color-muted)] py-12">
          {tab === "received" ? "No tenés solicitudes recibidas." : "No has enviado solicitudes."}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredTrades.map((trade) => (
            <div key={trade.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 px-5">
              <div className="flex items-center gap-4 max-sm:flex-wrap">
                <div className={`w-10 h-10 rounded-full grid place-items-center shrink-0 ${trade.to_user_id === user?.id ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]" : "bg-[var(--color-field-soft)] text-[var(--color-field)]"}`}>
                  {trade.to_user_id === user?.id ? <Inbox size={18} /> : <Send size={18} />}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">
                    {trade.to_user_id === user?.id
                      ? `${trade.from_user?.[0]?.display_name || "Alguien"} te ofrece ${trade.offered_card_name}`
                      : `Ofreciste ${trade.offered_card_name} a ${trade.to_user?.[0]?.display_name || "Alguien"}`}
                  </div>
                  <div className="text-xs text-[var(--color-muted)] mt-0.5">
                    {trade.to_user_id === user?.id ? `A cambio de: ${trade.requested_card_name}` : `Por: ${trade.requested_card_name}`} · {new Date(trade.created_at).toLocaleDateString("es-CR")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    trade.status === "completed" ? "bg-[oklch(94%_0.06_156)] text-[var(--color-success)]" :
                    trade.status === "rejected" || trade.status === "cancelled" ? "bg-[oklch(94%_0.05_22)] text-[var(--color-danger)]" :
                    "bg-[oklch(95%_0.06_72)] text-[var(--color-warning)]"
                  }`}>
                    {trade.status === "pending" ? (trade.to_user_id === user?.id ? "Pendiente" : "Enviada") :
                     trade.status === "completed" ? "Completado" : trade.status === "rejected" ? "Rechazado" : "Cancelado"}
                  </span>
                  {trade.status === "pending" && (
                    <>
                      {trade.to_user_id === user?.id && (
                        <>
                          <button onClick={() => handleAccept(trade)} className="px-3 py-1.5 rounded-full bg-[var(--color-success)] text-white text-xs font-semibold cursor-pointer border-none"><Check size={14} /></button>
                          <button onClick={() => handleReject(trade)} className="px-3 py-1.5 rounded-full bg-[var(--color-danger)] text-white text-xs font-semibold cursor-pointer border-none"><X size={14} /></button>
                        </>
                      )}
                      {trade.from_user_id === user?.id && (
                        <button onClick={() => handleCancel(trade)} className="px-3 py-1.5 rounded-full bg-[var(--color-danger)] text-white text-xs font-semibold cursor-pointer border-none">Cancelar</button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
