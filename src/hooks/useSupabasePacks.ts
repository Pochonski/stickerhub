"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { useAuth } from "@/presentation/components/auth/AuthProvider";
import type { PackBundle } from "@/core/domain/value-objects";
import { PACK_BUNDLES, SPECIAL_STARS } from "@/core/domain/value-objects";
import { calculateCoinValue } from "@/core/domain/rules";

export { PACK_BUNDLES, type PackBundle };
export { calculateCoinValue as coinValue };
export { SPECIAL_STARS };

export function usePacks() {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(0);
  const [totalOpened, setTotalOpened] = useState(0);
  const [coins, setCoins] = useState(2000);
  const [loading, setLoading] = useState(true);

  const quantityRef = useRef(0);
  const totalOpenedRef = useRef(0);
  const coinsRef = useRef(2000);

  quantityRef.current = quantity;
  totalOpenedRef.current = totalOpened;
  coinsRef.current = coins;

  const fetchPacks = useCallback(async () => {
    if (!user) {
      setQuantity(0);
      setCoins(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const supabase = getSupabase();
      const { data } = await supabase
        .from("user_packs")
        .select("quantity, total_opened, coins")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!data) {
        await supabase.from("user_packs").upsert(
          { user_id: user.id, quantity: 0, coins: 2000, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );
        setQuantity(0);
        setCoins(2000);
      } else {
        setQuantity(data.quantity);
        setCoins(data.coins ?? 2000);
        setTotalOpened(data.total_opened ?? 0);
      }
    } catch (e) { console.error("fetchPacks error:", e); }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchPacks(); }, [fetchPacks]);

  useEffect(() => {
    if (!user) return;
    const supabase = getSupabase();
    const channel = supabase
      .channel(`packs:${user.id}`)
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "user_packs", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const r = payload.new as { quantity?: number; coins?: number; total_opened?: number };
          if (typeof r.quantity === "number") setQuantity(r.quantity);
          if (typeof r.coins === "number") setCoins(r.coins);
          if (typeof r.total_opened === "number") setTotalOpened(r.total_opened);
        }
      )
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "user_packs", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const r = payload.new as { quantity?: number; coins?: number; total_opened?: number };
          if (typeof r.quantity === "number") setQuantity(r.quantity);
          if (typeof r.coins === "number") setCoins(r.coins);
          if (typeof r.total_opened === "number") setTotalOpened(r.total_opened);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const decrementPacks = useCallback((count: number): number => {
    const qty = quantityRef.current;
    if (qty <= 0 || count <= 0 || !user) return 0;
    const actualCount = Math.min(count, qty);
    const newQty = qty - actualCount;
    const newOpened = totalOpenedRef.current + actualCount;
    setQuantity(newQty);
    setTotalOpened(newOpened);

    (async () => {
      try {
        const supabase = getSupabase();
        await supabase.from("user_packs").upsert(
          { user_id: user.id, quantity: newQty, total_opened: newOpened, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );
      } catch {
        setQuantity(qty);
        setTotalOpened(totalOpenedRef.current);
      }
    })();

    return actualCount;
  }, [user]);

  const decrementPack = useCallback((): number => {
    return decrementPacks(1);
  }, [decrementPacks]);

  const spendCoins = useCallback(async (amount: number): Promise<boolean> => {
    const c = coinsRef.current;
    if (c < amount || !user) return false;
    const newCoins = c - amount;
    setCoins(newCoins);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from("user_packs").upsert(
        { user_id: user.id, coins: newCoins, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
      if (error) throw error;
    } catch {
      setCoins(c);
      return false;
    }
    return true;
  }, [user]);

  const addCoins = useCallback(async (amount: number) => {
    if (!user) return;
    const c = coinsRef.current;
    const newCoins = c + amount;
    setCoins(newCoins);
    try {
      const supabase = getSupabase();
      await supabase.from("user_packs").upsert(
        { user_id: user.id, coins: newCoins, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
    } catch { setCoins(c); }
  }, [user]);

  const buyPacks = useCallback(async (bundle: PackBundle): Promise<boolean> => {
    const c = coinsRef.current;
    const qty = quantityRef.current;
    if (c < bundle.price || !user) return false;
    const newCoins = c - bundle.price;
    const newQty = qty + bundle.quantity;
    setCoins(newCoins);
    setQuantity(newQty);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from("user_packs").upsert(
        { user_id: user.id, quantity: newQty, coins: newCoins, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
      if (error) throw error;
      return true;
    } catch {
      setCoins(c);
      setQuantity(qty);
      return false;
    }
  }, [user]);

  const grantPacks = useCallback(async (count: number) => {
    if (!user || count <= 0) return;
    const qty = quantityRef.current;
    const newQty = qty + count;
    setQuantity(newQty);
    try {
      const supabase = getSupabase();
      await supabase.from("user_packs").upsert(
        { user_id: user.id, quantity: newQty, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
    } catch { setQuantity(qty); }
  }, [user]);

  return { quantity, totalOpened, coins, loading, decrementPack, decrementPacks, spendCoins, addCoins, buyPacks, grantPacks, refresh: fetchPacks };
}
