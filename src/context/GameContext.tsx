"use client";

import { createContext, useContext, useCallback, useEffect, type ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useCollection } from "@/hooks/useSupabaseCollection";
import { usePacks } from "@/hooks/useSupabasePacks";
import { useAuth } from "@/components/auth/AuthProvider";
import type { TradeOffer, GameState } from "@/data/types";

interface GameContextValue {
  state: GameState;
  collectCard: (cardId: string) => void;
  openPack: (teamId: string) => number;
  openPacks: (count: number) => void;
  requestTrade: (cardId: string, cardName: string, fromUser: string, offeredCardId: string, offeredCardName: string) => void;
  cancelTrade: (tradeId: string) => void;
  completeTrade: (tradeId: string) => void;
  isCollected: (cardId: string) => boolean;
  isDuplicate: (cardId: string) => boolean;
  getDuplicateCount: () => number;
  getCollectedCount: () => number;
  resetGame: () => void;
  addPacks: (count: number) => void;
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
  const usingSupabase = !!user;

  // Sync localStorage → Supabase on first auth
  useEffect(() => {
    if (!user || !localState || Object.keys(localState.collected).length === 0) return;
    // Migration would go here
  }, [user, localState]);

  // Build state from Supabase when available, fall back to localStorage
  const state: GameState = usingSupabase
    ? {
        collected: Object.fromEntries(
          supabaseCollection.collected
            .filter((c) => !c.is_duplicate)
            .map((c) => [c.card_id, true])
        ),
        duplicates: supabaseCollection.duplicates,
        packs: supabasePacks.quantity,
        trades: [],
        openedPacks: supabasePacks.totalOpened,
      }
    : localState;

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
    (teamId: string) => {
      if (usingSupabase) {
        supabasePacks.decrementPack();
        return supabasePacks.quantity;
      }
      if (localState.packs <= 0) return 0;
      setLocalState((prev) => ({
        ...prev,
        packs: prev.packs - 1,
        openedPacks: prev.openedPacks + 1,
      }));
      return localState.packs;
    },
    [usingSupabase, supabasePacks, localState.packs, setLocalState]
  );

  const openPacks = useCallback(
    (count: number) => {
      if (usingSupabase) {
        for (let i = 0; i < count; i++) {
          supabasePacks.decrementPack();
        }
        return;
      }
      setLocalState((prev) => ({
        ...prev,
        packs: Math.max(0, prev.packs - count),
        openedPacks: prev.openedPacks + count,
      }));
    },
    [usingSupabase, supabasePacks, setLocalState]
  );

  const requestTrade = useCallback(
    (cardId: string, cardName: string, fromUser: string, offeredCardId: string, offeredCardName: string) => {
      setLocalState((prev) => ({
        ...prev,
        trades: [
          ...prev.trades,
          {
            id: `trade-${Date.now()}`,
            cardId, cardName, fromUser,
            status: "pending",
            date: new Date().toISOString(),
            offeredCardId, offeredCardName,
            direction: "sent",
          },
        ],
      }));
    },
    [setLocalState]
  );

  const cancelTrade = useCallback(
    (tradeId: string) => {
      setLocalState((prev) => ({
        ...prev,
        trades: prev.trades.map((t) => (t.id === tradeId ? { ...t, status: "cancelled" as const } : t)),
      }));
    },
    [setLocalState]
  );

  const completeTrade = useCallback(
    (tradeId: string) => {
      setLocalState((prev) => ({
        ...prev,
        trades: prev.trades.map((t) => (t.id === tradeId ? { ...t, status: "completed" as const } : t)),
      }));
    },
    [setLocalState]
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
