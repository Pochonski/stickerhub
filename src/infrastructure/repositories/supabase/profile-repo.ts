import { getSupabase } from "@/infrastructure/supabase/client";
import type { ProfileRepository, ProfileDTO, ProfileStats } from "@/core/application/ports";

export class SupabaseProfileRepository implements ProfileRepository {
  async getProfile(userId: string): Promise<ProfileDTO | null> {
    const sb = getSupabase();
    const { data } = await sb
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    return (data as ProfileDTO) ?? null;
  }

  async updateProfile(
    userId: string,
    data: Partial<Pick<ProfileDTO, "display_name" | "avatar_url" | "country">>
  ): Promise<void> {
    const sb = getSupabase();
    await sb.from("profiles").update(data).eq("id", userId);
  }

  async getStats(userId: string): Promise<ProfileStats> {
    const sb = getSupabase();
    const { count: totalCollected } = await sb
      .from("user_collections")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_duplicate", false);

    const { count: totalDuplicates } = await sb
      .from("user_collections")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_duplicate", true);

    const { count: totalTrades } = await sb
      .from("trade_offers")
      .select("*", { count: "exact", head: true })
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`);

    const { data: profile } = await sb
      .from("profiles")
      .select("reputation")
      .eq("id", userId)
      .single();

    return {
      totalCollected: totalCollected ?? 0,
      totalDuplicates: totalDuplicates ?? 0,
      totalTrades: totalTrades ?? 0,
      reputation: (profile as { reputation?: number })?.reputation ?? 100,
    };
  }
}
