"use client";

import { createContext, useContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocalStorage } from "@/presentation/hooks/useLocalStorage";
import { useCollection } from "@/hooks/useSupabaseCollection";
import { usePacks } from "@/hooks/useSupabasePacks";
import { useAuth } from "@/presentation/components/auth/AuthProvider";
import { getSupabase } from "@/lib/supabase/client";
import type { TradeOffer, GameState } from "@/data/types";
import type { PackBundle } from "@/hooks/useSupabasePacks";
import { PLAYERS } from "@/data/players";

interface GameContextValue {
  state: GameState;
  collectCard: (cardId: string) => void;
  openPack: (teamId: string) => number;
  openPacks: (count: number) => number;
  requestTrade: (cardId: string, cardName: string, toUserId: string, offeredCardId: string, offeredCardName: string, listingId?: string) => void;
  cancelTrade: (tradeId: string) => void;
  completeTrade: (tradeId: string) => void;
  isCollected: (cardId: string) => boolean;
  isDuplicate: (cardId: string) => boolean;
  getDuplicateCount: () => number;
  getCollectedCount: () => number;
  resetGame: () => void;
  addPacks: (count: number) => void;
  buyPacks: (bundle: PackBundle) => Promise<boolean>;
  refreshCollection: () => Promise<void>;
  addCoins: (amount: number) => Promise<void>;
  spendCoins: (amount: number) => Promise<boolean>;
  grantPacks: (count: number) => Promise<void>;
  completedTeams: string[];
  checkTeamCompletions: () => Promise<string[]>;
  usingSupabase: boolean;
  coins: number;
}

const DEFAULT_STATE: GameState = {
  collected: {},
  duplicates: [],
  packs: 5,
  trades: [],
  openedPacks: 0,
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [localState, setLocalState] = useLocalStorage<GameState>("stickerhub-state", DEFAULT_STATE);
  const supabaseCollection = useCollection();
  const supabasePacks = usePacks();
  const [supabaseTrades, setSupabaseTrades] = useState<TradeOffer[]>([]);
  const usingSupabase = !!user;
  const [completedTeams, setCompletedTeams] = useLocalStorage<string[]>("stickerhub-completed-teams", []);

  // Check for newly completed teams and award coins
  const checkTeamCompletions = useCallback(async (): Promise<string[]> => {
    const collected = usingSupabase
      ? Object.fromEntries(supabaseCollection.collected.filter(c => !c.is_duplicate).map(c => [c.card_id, true]))
      : localState.collected;

    const newlyCompleted: string[] = [];
    for (const teamId of Object.keys(PLAYERS)) {
      if (completedTeams.includes(teamId)) continue;
      const players = PLAYERS[teamId];
      const collectedCount = players.filter(p => collected[p.id]).length;
      if (collectedCount >= players.length && players.length > 0) {
        newlyCompleted.push(teamId);
      }
    }

    if (newlyCompleted.length > 0) {
      const prev = completedTeams;
      const updated = [...prev, ...newlyCompleted];
      setCompletedTeams(updated);
      for (const _ of newlyCompleted) {
        await supabasePacks.addCoins(2000);
      }
    }
    return newlyCompleted;
  }, [usingSupabase, supabaseCollection.collected, localState.collected, completedTeams, setCompletedTeams, supabasePacks]);

  // Fetch trades from Supabase
  const fetchTrades = useCallback(async () => {
    if (!user) return;
    try {
      const sb = getSupabase();
      const { data } = await sb
        .from("trade_offers")
        .select("*")
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
        .order("created_at", { ascending: false });
      if (data) {
        setSupabaseTrades(data.map((t: any) => ({
          id: t.id,
          cardId: t.card_id || t.cardId || "",
          cardName: t.card_name || t.cardName || "",
          fromUser: t.fromUser || (t.from_user_id === user.id ? (t.to_user_name || "") : ""),
          status: t.status,
          date: t.date || t.created_at,
          offeredCardId: t.offered_card_id || t.offeredCardId || "",
          offeredCardName: t.offered_card_name || t.offeredCardName || "",
          direction: t.direction || (t.from_user_id === user.id ? "sent" : "received"),
        }) as TradeOffer));
      }
    } catch (e) { console.error("fetchTrades error:", e); }
  }, [user]);

  useEffect(() => {
    if (usingSupabase) fetchTrades();
  }, [usingSupabase, fetchTrades]);

  // Sync localStorage → Supabase on first auth
  useEffect(() => {
    if (!user || !localState || Object.keys(localState.collected).length === 0) return;
    // Migration would go here
  }, [user, localState]);

  // Build state from Supabase when available, fall back to localStorage
  const state: GameState = useMemo(() => usingSupabase
    ? {
        collected: Object.fromEntries(
          supabaseCollection.collected
            .filter((c) => !c.is_duplicate)
            .map((c) => [c.card_id, true])
        ),
        duplicates: supabaseCollection.duplicates,
        packs: supabasePacks.quantity,
        trades: supabaseTrades,
        openedPacks: supabasePacks.totalOpened,
      }
    : localState, [usingSupabase, supabaseCollection.collected, supabaseCollection.duplicates, supabasePacks.quantity, supabasePacks.totalOpened, supabaseTrades, localState]);

  const collectCard = useCallback(
    (cardId: string) => {
      if (usingSupabase) {
        const isCollected = supabaseCollection.isCollected(cardId);
        supabaseCollection.addCard(cardId, isCollected, "pack");
        return;
      }
      setLocalState((prev) => {
        const alreadyCollected = prev.collected[cardId];
        if (alreadyCollected) {
          const alreadyDuplicate = prev.duplicates.includes(cardId);
          if (alreadyDuplicate) return prev;
          return { ...prev, duplicates: [...prev.duplicates, cardId] };
        }
        return { ...prev, collected: { ...prev.collected, [cardId]: true } };
      });
    },
    [usingSupabase, supabaseCollection, setLocalState]
  );

  const openPack = useCallback(
    (teamId: string): number => {
      if (usingSupabase) {
        return supabasePacks.decrementPack();
      }
      if (localState.packs <= 0) return 0;
      setLocalState((prev) => ({
        ...prev,
        packs: prev.packs - 1,
        openedPacks: prev.openedPacks + 1,
      }));
      return 1;
    },
    [usingSupabase, supabasePacks, localState.packs, setLocalState]
  );

  const openPacks = useCallback(
    (count: number): number => {
      if (usingSupabase) {
        return supabasePacks.decrementPacks(count);
      }
      setLocalState((prev) => {
        const actual = Math.min(count, prev.packs);
        return {
          ...prev,
          packs: Math.max(0, prev.packs - count),
          openedPacks: prev.openedPacks + count,
        };
      });
      return Math.min(count, localState.packs);
    },
    [usingSupabase, supabasePacks, localState.packs, setLocalState]
  );

  const requestTrade = useCallback(
    async (cardId: string, cardName: string, toUserId: string, offeredCardId: string, offeredCardName: string, listingId?: string) => {
      if (usingSupabase) {
        const sb = getSupabase();
        const { error } = await sb.from("trade_offers").insert({
          from_user_id: user!.id,
          to_user_id: toUserId,
          listing_id: listingId,
          requested_card_id: cardId,
          requested_card_name: cardName,
          offered_card_id: offeredCardId,
          offered_card_name: offeredCardName,
        });
        if (!error) {
          await sb.from("notifications").insert({
            user_id: toUserId,
            type: "trade_request",
            title: "Nueva solicitud de intercambio",
            body: `Quieren intercambiar ${offeredCardName} por tu ${cardName}`,
          });
          fetchTrades();
          return;
        }
      }
      // Fallback to localStorage
      setLocalState((prev) => ({
        ...prev,
        trades: [
          ...prev.trades,
          { id: `trade-${Date.now()}`, cardId, cardName, fromUser: toUserId, status: "pending", date: new Date().toISOString(), offeredCardId, offeredCardName, direction: "sent" },
        ],
      }));
    },
    [usingSupabase, user, fetchTrades, setLocalState]
  );

  const cancelTrade = useCallback(
    async (tradeId: string) => {
      if (usingSupabase) {
        const sb = getSupabase();
        await sb.from("trade_offers").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", tradeId).eq("from_user_id", user!.id);
        fetchTrades();
        return;
      }
      setLocalState((prev) => ({
        ...prev,
        trades: prev.trades.map((t) => (t.id === tradeId ? { ...t, status: "cancelled" as const } : t)),
      }));
    },
    [usingSupabase, user, fetchTrades, setLocalState]
  );

  const completeTrade = useCallback(
    async (tradeId: string) => {
      if (usingSupabase) {
        const { data: { session } } = await getSupabase().auth.getSession();
        await fetch(`/api/trades/${tradeId}/accept`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });
        fetchTrades();
        supabaseCollection.refresh();
        return;
      }
      setLocalState((prev) => ({
        ...prev,
        trades: prev.trades.map((t) => (t.id === tradeId ? { ...t, status: "completed" as const } : t)),
      }));
    },
    [usingSupabase, fetchTrades, supabaseCollection, setLocalState]
  );

  const isCollected = useCallback(
    (cardId: string) =>
      usingSupabase
        ? supabaseCollection.isCollected(cardId)
        : !!localState.collected[cardId],
    [usingSupabase, supabaseCollection, localState.collected]
  );

  const isDuplicate = useCallback(
    (cardId: string) =>
      usingSupabase
        ? supabaseCollection.isDuplicate(cardId)
        : localState.duplicates.includes(cardId),
    [usingSupabase, supabaseCollection, localState.duplicates]
  );

  const getDuplicateCount = useCallback(
    () => usingSupabase ? supabaseCollection.duplicateCount : localState.duplicates.length,
    [usingSupabase, supabaseCollection, localState.duplicates]
  );

  const getCollectedCount = useCallback(
    () => usingSupabase ? supabaseCollection.collectedCount : Object.keys(localState.collected).length,
    [usingSupabase, supabaseCollection, localState.collected]
  );

  const resetGame = useCallback(() => {
    setLocalState(DEFAULT_STATE);
  }, [setLocalState]);

  const addPacks = useCallback(
    (count: number) => {
      if (usingSupabase) {
        supabasePacks.addCoins(count * 500); // For existing demo compatibility
        return;
      }
      setLocalState((prev) => ({ ...prev, packs: prev.packs + count }));
    },
    [usingSupabase, supabasePacks, setLocalState]
  );

  return (
    <GameContext.Provider
      value={{
        state,
        collectCard,
        openPack,
        openPacks,
        requestTrade,
        cancelTrade,
        completeTrade,
        isCollected,
        isDuplicate,
        getDuplicateCount,
        getCollectedCount,
        resetGame,
        addPacks,
        buyPacks: supabasePacks.buyPacks,
        refreshCollection: supabaseCollection.refresh,
        addCoins: supabasePacks.addCoins,
        spendCoins: supabasePacks.spendCoins,
        grantPacks: supabasePacks.grantPacks,
        completedTeams,
        checkTeamCompletions,
        usingSupabase,
        coins: supabasePacks.coins,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
