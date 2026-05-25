// GET /api/trades — Get user's trade offers
// POST /api/trades — Create a trade offer

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("trade_offers")
    .select("*, from_user:profiles!trade_offers_from_user_id_fkey(display_name, avatar_url), to_user:profiles!trade_offers_to_user_id_fkey(display_name, avatar_url)")
    .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { toUserId, listingId, requestedCardId, requestedCardName, offeredCardId, offeredCardName } = await req.json();

  if (!toUserId || !requestedCardId || !offeredCardId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify offered card is a duplicate owned by the requesting user
  const { data: offeredOwned } = await supabase
    .from("user_collections")
    .select("id")
    .eq("user_id", user.id)
    .eq("card_id", offeredCardId)
    .eq("is_duplicate", true)
    .single();

  if (!offeredOwned) {
    return NextResponse.json({ error: "You don't own the offered card as duplicate" }, { status: 400 });
  }

  // Create the trade offer
  const { data, error } = await supabase
    .from("trade_offers")
    .insert({
      from_user_id: user.id,
      to_user_id: toUserId,
      listing_id: listingId,
      requested_card_id: requestedCardId,
      requested_card_name: requestedCardName,
      offered_card_id: offeredCardId,
      offered_card_name: offeredCardName,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Create notification for the recipient
  await supabase.from("notifications").insert({
    user_id: toUserId,
    type: "trade_request",
    title: "Nueva solicitud de intercambio",
    body: `Quieren intercambiar ${offeredCardName} por tu ${requestedCardName}`,
    reference_id: data.id,
  });

  return NextResponse.json(data, { status: 201 });
}
