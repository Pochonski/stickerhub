"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

interface CollectionItem {
  card_id: string;
  is_duplicate: boolean;
  collected_at: string;
  source: string;
}

export function useCollection() {
  const { user } = useAuth();
  const [collected, setCollected] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCollection = useCallback(async () => {
    if (!user) {
      setCollected([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const supabase = getSupabase();
      const { data } = await supabase
        .from("user_collections")
        .select("card_id, is_duplicate, collected_at, source")
        .eq("user_id", user.id)
        .order("collected_at", { ascending: false });
      setCollected(data ?? []);
    } catch {}
    setLoading(false);
  }, [user]);

  // Fetch when user changes (login/logout)
  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  const addCard = useCallback(async (cardId: string, isDuplicate = false, source = "pack") => {
    const supabase = getSupabase();
    if (!user) return false;

    const { error } = await supabase
      .from("user_collections")
      .upsert(
        {
          user_id: user.id,
          card_id: cardId,
          is_duplicate: isDuplicate,
          source,
          collected_at: new Date().toISOString(),
        },
        { onConflict: "user_id, card_id, is_duplicate" }
      );

    if (!error) {
      setCollected((prev) => {
        const filtered = prev.filter(
          (c) => !(c.card_id === cardId && c.is_duplicate === isDuplicate)
        );
        return [
          { card_id: cardId, is_duplicate: isDuplicate, collected_at: new Date().toISOString(), source },
          ...filtered,
        ];
      });
    }
    return !error;
  }, [user]);

  const isCollected = useCallback(
    (cardId: string) => collected.some((c) => c.card_id === cardId && !c.is_duplicate),
    [collected]
  );

  const isDuplicate = useCallback(
    (cardId: string) => collected.some((c) => c.card_id === cardId && c.is_duplicate),
    [collected]
  );

  return {
    collected,
    loading,
    addCard,
    isCollected,
    isDuplicate,
    collectedCount: collected.filter((c) => !c.is_duplicate).length,
    duplicateCount: collected.filter((c) => c.is_duplicate).length,
    duplicates: collected.filter((c) => c.is_duplicate).map((c) => c.card_id),
    refresh: fetchCollection,
  };
}
