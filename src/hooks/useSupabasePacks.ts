"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

const SPECIAL_STARS = new Set(["arg4", "por5", "fra1", "bra2", "cro2", "eng1", "esp1", "mar1", "esp3", "eng2", "col1", "uru1", "ned1", "ger1"]);

export function coinValue(rating: number, cardId?: string): number {
  if (cardId && SPECIAL_STARS.has(cardId)) return 1300;
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
  const [coins, setCoins] = useState(2000);
  const [loading, setLoading] = useState(true);

  const quantityRef = useRef(0);
  const totalOpenedRef = useRef(0);
  const coinsRef = useRef(2000);

  useEffect(() => { quantityRef.current = quantity; }, [quantity]);
  useEffect(() => { totalOpenedRef.current = totalOpened; }, [totalOpened]);
  useEffect(() => { coinsRef.current = coins; }, [coins]);

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
    } catch {}
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchPacks(); }, [fetchPacks]);

  const decrementPacks = useCallback(async (count: number) => {
    const qty = quantityRef.current;
    if (qty <= 0 || count <= 0 || !user) return false;
    const actualCount = Math.min(count, qty);
    const newQty = qty - actualCount;
    const newOpened = totalOpenedRef.current + actualCount;
    setQuantity(newQty);
    setTotalOpened(newOpened);
    try {
      const supabase = getSupabase();
      await supabase.from("user_packs").upsert(
        { user_id: user.id, quantity: newQty, total_opened: newOpened, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
    } catch {
      setQuantity(qty);
      setTotalOpened(totalOpenedRef.current);
      return false;
    }
    return true;
  }, [user]);

  const decrementPack = useCallback(async () => {
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
    const c = coinsRef.current;
    const newCoins = c + amount;
    setCoins(newCoins);
    try {
      const supabase = getSupabase();
      await supabase.from("user_packs").upsert(
        { user_id: user!.id, coins: newCoins, updated_at: new Date().toISOString() },
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

  return { quantity, totalOpened, coins, loading, decrementPack, decrementPacks, spendCoins, addCoins, buyPacks, refresh: fetchPacks };
}
