import { getSupabase } from "@/infrastructure/supabase/client";
import { supabaseAdmin } from "@/infrastructure/supabase/admin";
import type { TradeRepository, CreateTradeOfferDTO } from "@/core/application/ports";
import type { TradeOffer } from "@/core/domain/models";

export class SupabaseTradeRepository implements TradeRepository {
  async getTrades(userId: string): Promise<TradeOffer[]> {
    const sb = getSupabase();
    const { data } = await sb
      .from("trade_offers")
      .select("*")
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
      .order("created_at", { ascending: false });
    return (data as TradeOffer[]) ?? [];
  }

  async createTradeOffer(
    offer: CreateTradeOfferDTO & { fromUserId: string }
  ): Promise<TradeOffer> {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("trade_offers")
      .insert({
        from_user_id: offer.fromUserId,
        to_user_id: offer.toUserId,
        listing_id: offer.listingId,
        requested_card_id: offer.requestedCardId,
        requested_card_name: offer.requestedCardName,
        offered_card_id: offer.offeredCardId,
        offered_card_name: offer.offeredCardName,
      })
      .select()
      .single();

    if (error) throw error;
    return data as TradeOffer;
  }

  async cancelTrade(tradeId: string, userId: string): Promise<void> {
    const sb = getSupabase();
    await sb
      .from("trade_offers")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", tradeId)
      .eq("from_user_id", userId);
  }

  async rejectTrade(tradeId: string, userId: string): Promise<void> {
    const sb = getSupabase();
    await sb
      .from("trade_offers")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("id", tradeId)
      .eq("to_user_id", userId);
  }

  async acceptTrade(tradeId: string, userId: string): Promise<void> {
    const { data: trade } = await supabaseAdmin
      .from("trade_offers")
      .select("*")
      .eq("id", tradeId)
      .eq("to_user_id", userId)
      .eq("status", "pending")
      .single();

    if (!trade) throw new Error("Trade not found or not pending");

    await supabaseAdmin.from("user_collections").delete()
      .eq("user_id", trade.from_user_id)
      .eq("card_id", trade.offered_card_id)
      .eq("is_duplicate", true);

    await supabaseAdmin.from("user_collections").upsert({
      user_id: userId,
      card_id: trade.offered_card_id,
      is_duplicate: false,
      source: "trade",
      collected_at: new Date().toISOString(),
    }, { onConflict: "user_id, card_id, is_duplicate" });

    await supabaseAdmin.from("user_collections").delete()
      .eq("user_id", userId)
      .eq("card_id", trade.requested_card_id)
      .eq("is_duplicate", true);

    await supabaseAdmin.from("user_collections").upsert({
      user_id: trade.from_user_id,
      card_id: trade.requested_card_id,
      is_duplicate: false,
      source: "trade",
      collected_at: new Date().toISOString(),
    }, { onConflict: "user_id, card_id, is_duplicate" });

    await supabaseAdmin.from("trade_offers").update({
      status: "completed",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", tradeId);

    if (trade.listing_id) {
      await supabaseAdmin.from("trade_listings").update({
        is_active: false,
        updated_at: new Date().toISOString(),
      }).eq("id", trade.listing_id);
    }

    await supabaseAdmin.rpc("increment_reputation", { user_id: trade.from_user_id });
    await supabaseAdmin.rpc("increment_reputation", { user_id: userId });

    await supabaseAdmin.from("notifications").insert({
      user_id: trade.from_user_id,
      type: "trade_completed",
      title: "Intercambio completado",
      body: `Recibiste ${trade.requested_card_name} a cambio de ${trade.offered_card_name}`,
      reference_id: tradeId,
    });
  }
}
