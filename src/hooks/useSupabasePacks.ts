"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

interface PackBundle {
  quantity: number;
  price: number;
  label: string;
  savings: string;
}

export const PACK_BUNDLES: PackBundle[] = [
  { quantity: 1, price: 500, label: "1 sobre", savings: "" },
  { quantity: 3, price: 1350, label: "3 sobres", savings: "ahorrá 150" },
  { quantity: 5, price: 2000, label: "5 sobres", savings: "ahorrá 500" },
];

export function coinValue(rating: number): number {
  if (rating >= 90) return 900;
  if (rating >= 85) return 700;
  if (rating >= 80) return 500;
  if (rating >= 75) return 300;
  return 150;
}

export function usePacks() {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(0);
  const [totalOpened, setTotalOpened] = useState(0);
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);

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
          { user_id: user.id, quantity: 0, coins: 500, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );
        setQuantity(0);
        setCoins(500);
      } else {
        setQuantity(data.quantity);
        setCoins(data.coins ?? 500);
        setTotalOpened(data.total_opened ?? 0);
      }
    } catch {}
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchPacks(); }, [fetchPacks]);

  const decrementPack = useCallback(async () => {
    if (quantity <= 0 || !user) return false;
    const newQty = quantity - 1;
    const newOpened = totalOpened + 1;
    setQuantity(newQty);
    setTotalOpened(newOpened);
    try {
      const supabase = getSupabase();
      await supabase.from("user_packs").upsert(
        { user_id: user.id, quantity: newQty, total_opened: newOpened, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
    } catch {
      setQuantity(quantity);
      setTotalOpened(totalOpened);
      return false;
    }
    return true;
  }, [quantity, totalOpened, user]);

  const spendCoins = useCallback(async (amount: number): Promise<boolean> => {
    if (coins < amount || !user) return false;
    const newCoins = coins - amount;
    setCoins(newCoins);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from("user_packs").upsert(
        { user_id: user.id, coins: newCoins, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
      if (error) throw error;
    } catch {
      setCoins(coins);
      return false;
    }
    return true;
  }, [coins, user]);

  const addCoins = useCallback(async (amount: number) => {
    const newCoins = coins + amount;
    setCoins(newCoins);
    try {
      const supabase = getSupabase();
      await supabase.from("user_packs").upsert(
        { user_id: user!.id, coins: newCoins, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
    } catch { setCoins(coins); }
  }, [coins, user]);

  const buyPacks = useCallback(async (bundle: PackBundle): Promise<boolean> => {
    if (coins < bundle.price || !user) return false;
    const newCoins = coins - bundle.price;
    const newQty = quantity + bundle.quantity;
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
      setCoins(coins);
      setQuantity(quantity);
      return false;
    }
  }, [coins, quantity, user]);

  return { quantity, totalOpened, coins, loading, decrementPack, spendCoins, addCoins, buyPacks, refresh: fetchPacks };
}
