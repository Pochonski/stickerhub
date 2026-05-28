import { getSupabase } from "@/infrastructure/supabase/client";
import type { PackRepository, PackState } from "@/core/application/ports";
import type { PackBundle } from "@/core/domain/value-objects";

export class SupabasePackRepository implements PackRepository {
  async getPackState(userId: string): Promise<PackState> {
    const sb = getSupabase();
    const { data } = await sb
      .from("user_packs")
      .select("quantity, total_opened, coins")
      .eq("user_id", userId)
      .maybeSingle();

    if (!data) {
      await sb.from("user_packs").upsert({
        user_id: userId,
        quantity: 0,
        coins: 2000,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      return { quantity: 0, totalOpened: 0, coins: 2000 };
    }

    return {
      quantity: data.quantity ?? 0,
      totalOpened: data.total_opened ?? 0,
      coins: data.coins ?? 2000,
    };
  }

  async decrementPack(userId: string): Promise<number> {
    return this.decrementPacks(userId, 1);
  }

  async decrementPacks(userId: string, count: number): Promise<number> {
    const state = await this.getPackState(userId);
    const actual = Math.min(count, state.quantity);
    if (actual <= 0) return 0;

    const sb = getSupabase();
    const newQty = state.quantity - actual;
    const newOpened = state.totalOpened + actual;
    await sb.from("user_packs").upsert({
      user_id: userId,
      quantity: newQty,
      total_opened: newOpened,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    return actual;
  }

  async spendCoins(userId: string, amount: number): Promise<boolean> {
    const state = await this.getPackState(userId);
    if (state.coins < amount) return false;

    const sb = getSupabase();
    const { error } = await sb.from("user_packs").upsert({
      user_id: userId,
      coins: state.coins - amount,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    return !error;
  }

  async addCoins(userId: string, amount: number): Promise<void> {
    const state = await this.getPackState(userId);
    const sb = getSupabase();
    await sb.from("user_packs").upsert({
      user_id: userId,
      coins: state.coins + amount,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
  }

  async buyPacks(userId: string, bundle: PackBundle): Promise<boolean> {
    const state = await this.getPackState(userId);
    if (state.coins < bundle.price) return false;

    const sb = getSupabase();
    const { error } = await sb.from("user_packs").upsert({
      user_id: userId,
      quantity: state.quantity + bundle.quantity,
      coins: state.coins - bundle.price,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    return !error;
  }

  async grantPacks(userId: string, count: number): Promise<void> {
    const state = await this.getPackState(userId);
    const sb = getSupabase();
    await sb.from("user_packs").upsert({
      user_id: userId,
      quantity: state.quantity + count,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
  }
}
