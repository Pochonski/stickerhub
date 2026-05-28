import { getSupabase } from "@/infrastructure/supabase/client";
import { supabaseAdmin } from "@/infrastructure/supabase/admin";
import type { ListingRepository, ListingDTO, PublishListingDTO } from "@/core/application/ports";

export class SupabaseListingRepository implements ListingRepository {
  async getActiveListings(filters: {
    search?: string;
    page?: number;
    limit?: number;
    excludeUserId?: string;
  }): Promise<ListingDTO[]> {
    const sb = getSupabase();
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 50);

    let query = sb
      .from("trade_listings")
      .select("id, card_id, card_name, team_name, looking_for, created_at, user_id")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (filters.excludeUserId) {
      query = query.neq("user_id", filters.excludeUserId);
    }
    if (filters.search) {
      query = query.or(
        `card_name.ilike.%${filters.search}%,team_name.ilike.%${filters.search}%`
      );
    }

    const { data } = await query;
    return (data as ListingDTO[]) ?? [];
  }

  async publishListing(params: PublishListingDTO): Promise<ListingDTO> {
    await supabaseAdmin
      .from("trade_listings")
      .delete()
      .eq("user_id", params.userId)
      .eq("card_id", params.cardId);

    const { data, error } = await supabaseAdmin
      .from("trade_listings")
      .insert({
        user_id: params.userId,
        card_id: params.cardId,
        card_name: params.cardName,
        team_name: params.teamName ?? "",
        looking_for: params.lookingFor ?? null,
      })
      .select("id, card_id, card_name, team_name, looking_for, created_at, user_id")
      .single();

    if (error) throw error;
    return data as ListingDTO;
  }

  async unpublishListing(listingId: string, userId: string): Promise<void> {
    const sb = getSupabase();
    const { error } = await sb.rpc("unpublish_listing", {
      listing_id: listingId,
      owner_id: userId,
    });
    if (error) throw error;
  }

  async deactivateListing(listingId: string): Promise<void> {
    await supabaseAdmin
      .from("trade_listings")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", listingId);
  }
}
