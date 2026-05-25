"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

export function usePacks() {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(5);
  const [totalOpened, setTotalOpened] = useState(0);

  const fetchPacks = useCallback(async () => {
    if (!user) {
      setQuantity(5);
      setTotalOpened(0);
      return;
    }
    try {
      const supabase = getSupabase();
      const { data } = await supabase
        .from("user_packs")
        .select("quantity, total_opened")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!data) {
        // Create default packs row
        const { data: inserted } = await supabase
          .from("user_packs")
          .upsert(
            { user_id: user.id, quantity: 5, total_opened: 0, updated_at: new Date().toISOString() },
            { onConflict: "user_id" }
          )
          .select("quantity, total_opened")
          .single();
        if (inserted) {
          setQuantity(inserted.quantity);
          setTotalOpened(inserted.total_opened);
        }
        return;
      }

      setQuantity(data.quantity);
      setTotalOpened(data.total_opened);
    } catch {}
  }, [user]);

  useEffect(() => {
    fetchPacks();
  }, [fetchPacks]);

  const decrementPack = useCallback(async () => {
    if (quantity <= 0 || !user) return false;
    const newQty = quantity - 1;
    const newOpened = totalOpened + 1;
    setQuantity(newQty);
    setTotalOpened(newOpened);

    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from("user_packs")
        .upsert(
          { user_id: user.id, quantity: newQty, total_opened: newOpened, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );
      if (error) throw error;
    } catch {
      setQuantity(quantity);
      setTotalOpened(totalOpened);
      return false;
    }
    return true;
  }, [quantity, totalOpened, user]);

  const addPacks = useCallback(async (count: number) => {
    if (!user) return;
    const newQty = quantity + count;
    setQuantity(newQty);
    try {
      const supabase = getSupabase();
      await supabase
        .from("user_packs")
        .upsert(
          { user_id: user.id, quantity: newQty, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );
    } catch {}
  }, [quantity, user]);

  return { quantity, totalOpened, decrementPack, addPacks, refresh: fetchPacks };
}
