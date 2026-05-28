import { getSupabase } from "@/infrastructure/supabase/client";
import type { CollectionRepository, CollectionRecord } from "@/core/application/ports";

export class SupabaseCollectionRepository implements CollectionRepository {
  async getCollection(userId: string): Promise<CollectionRecord[]> {
    const sb = getSupabase();
    const { data } = await sb
      .from("user_collections")
      .select("*")
      .eq("user_id", userId);
    return (data as CollectionRecord[]) ?? [];
  }

  async addCard(userId: string, cardId: string, source?: string): Promise<void> {
    const sb = getSupabase();
    const isDuplicate = source === "duplicate";

    await sb.from("user_collections").upsert({
      user_id: userId,
      card_id: cardId,
      is_duplicate: isDuplicate,
      source: source ?? "manual",
      collected_at: new Date().toISOString(),
    }, { onConflict: "user_id, card_id, is_duplicate" });
  }

  async removeDuplicate(userId: string, cardId: string): Promise<void> {
    const sb = getSupabase();
    await sb
      .from("user_collections")
      .delete()
      .eq("user_id", userId)
      .eq("card_id", cardId)
      .eq("is_duplicate", true);
  }

  async isCollected(userId: string, cardId: string): Promise<boolean> {
    const collection = await this.getCollection(userId);
    return collection.some((c) => c.card_id === cardId);
  }

  async getDuplicates(userId: string): Promise<string[]> {
    const collection = await this.getCollection(userId);
    return collection
      .filter((c) => c.is_duplicate)
      .map((c) => c.card_id);
  }
}
