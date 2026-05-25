// PUT /api/trades/[id]/reject — Reject a trade offer

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

  const { error } = await supabase
    .from("trade_offers")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("to_user_id", user.id)
    .eq("status", "pending");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify initiator
  const { data: trade } = await supabase
    .from("trade_offers")
    .select("from_user_id, offered_card_name, requested_card_name")
    .eq("id", id)
    .single();

  if (trade) {
    await supabase.from("notifications").insert({
      user_id: trade.from_user_id,
      type: "trade_rejected",
      title: "Intercambio rechazado",
      body: `Tu oferta de ${trade.offered_card_name} por ${trade.requested_card_name} fue rechazada`,
      reference_id: id,
    });
  }

  return NextResponse.json({ success: true });
}
