// PUT /api/trades/[id]/accept — Accept a trade offer

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.slice(7);

  const verifyRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
    }
  );

  if (!verifyRes.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await verifyRes.json();
  const { id } = await params;

  // Get the trade offer
  const { data: trade, error: fetchError } = await supabaseAdmin
    .from("trade_offers")
    .select("*")
    .eq("id", id)
    .eq("to_user_id", user.id)
    .eq("status", "pending")
    .single();

  if (fetchError || !trade) {
    return NextResponse.json({ error: "Trade not found or not pending" }, { status: 404 });
  }

  // 1. Remove offered card from initiator's duplicates
  const { error: removeOffered } = await supabaseAdmin
    .from("user_collections")
    .delete()
    .eq("user_id", trade.from_user_id)
    .eq("card_id", trade.offered_card_id)
    .eq("is_duplicate", true);

  if (removeOffered) {
    return NextResponse.json({ error: "Failed to transfer offered card" }, { status: 500 });
  }

  // 2. Add offered card to recipient
  const { error: addOffered } = await supabaseAdmin
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
  const { error: removeRequested } = await supabaseAdmin
    .from("user_collections")
    .delete()
    .eq("user_id", user.id)
    .eq("card_id", trade.requested_card_id)
    .eq("is_duplicate", true);

  if (removeRequested) {
    return NextResponse.json({ error: "Failed to transfer requested card" }, { status: 500 });
  }

  // 4. Add requested card to initiator
  const { error: addRequested } = await supabaseAdmin
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
  const { error: completeError } = await supabaseAdmin
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
    await supabaseAdmin
      .from("trade_listings")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", trade.listing_id);
  }

  // 7. Update reputations
  await supabaseAdmin.rpc("increment_reputation", { user_id: trade.from_user_id });
  await supabaseAdmin.rpc("increment_reputation", { user_id: user.id });

  // 8. Notify initiator
  await supabaseAdmin.from("notifications").insert({
    user_id: trade.from_user_id,
    type: "trade_completed",
    title: "Intercambio completado",
    body: `Recibiste ${trade.requested_card_name} a cambio de ${trade.offered_card_name}`,
    reference_id: id,
  });

  return NextResponse.json({ success: true });
}
