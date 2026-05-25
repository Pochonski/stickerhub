// PUT /api/trades/[id]/accept — Accept a trade offer

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Get the trade offer
  const { data: trade, error: fetchError } = await supabase
    .from("trade_offers")
    .select("*")
    .eq("id", id)
    .eq("to_user_id", user.id)
    .eq("status", "pending")
    .single();

  if (fetchError || !trade) {
    return NextResponse.json({ error: "Trade not found or not pending" }, { status: 404 });
  }

  // Transfer cards in a transaction would be ideal, but Supabase JS doesn't support transactions directly.
  // Using sequential operations with validation:

  // 1. Remove offered card from initiator's duplicates
  const { error: removeOffered } = await supabase
    .from("user_collections")
    .delete()
    .eq("user_id", trade.from_user_id)
    .eq("card_id", trade.offered_card_id)
    .eq("is_duplicate", true);

  if (removeOffered) {
    return NextResponse.json({ error: "Failed to transfer offered card" }, { status: 500 });
  }

  // 2. Add offered card to recipient (or mark as duplicate if already owned)
  const { error: addOffered } = await supabase
    .from("user_collections")
    .upsert({
      user_id: user.id,
      card_id: trade.offered_card_id,
      is_duplicate: false,
      source: "trade",
      collected_at: new Date().toISOString(),
    }, { onConflict: "user_id, card_id, is_duplicate" });

  if (addOffered) {
    return NextResponse.json({ error: "Failed to add offered card" }, { status: 500 });
  }

  // 3. Remove requested card from recipient's duplicates
  const { error: removeRequested } = await supabase
    .from("user_collections")
    .delete()
    .eq("user_id", user.id)
    .eq("card_id", trade.requested_card_id)
    .eq("is_duplicate", true);

  if (removeRequested) {
    return NextResponse.json({ error: "Failed to transfer requested card" }, { status: 500 });
  }

  // 4. Add requested card to initiator
  const { error: addRequested } = await supabase
    .from("user_collections")
    .upsert({
      user_id: trade.from_user_id,
      card_id: trade.requested_card_id,
      is_duplicate: false,
      source: "trade",
      collected_at: new Date().toISOString(),
    }, { onConflict: "user_id, card_id, is_duplicate" });

  if (addRequested) {
    return NextResponse.json({ error: "Failed to add requested card" }, { status: 500 });
  }

  // 5. Mark trade as completed
  const { error: completeError } = await supabase
    .from("trade_offers")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (completeError) {
    return NextResponse.json({ error: completeError.message }, { status: 500 });
  }

  // 6. Deactivate listing
  if (trade.listing_id) {
    await supabase
      .from("trade_listings")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", trade.listing_id);
  }

  // 7. Update reputations
  await supabase.rpc("increment_reputation", { user_id: trade.from_user_id });
  await supabase.rpc("increment_reputation", { user_id: user.id });

  // 8. Notify initiator
  await supabase.from("notifications").insert({
    user_id: trade.from_user_id,
    type: "trade_completed",
    title: "Intercambio completado",
    body: `Recibiste ${trade.requested_card_name} a cambio de ${trade.offered_card_name}`,
    reference_id: id,
  });

  return NextResponse.json({ success: true });
}
