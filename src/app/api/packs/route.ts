// GET /api/packs — Get user's pack count
// POST /api/packs — Open a pack (decrements count, returns random cards)

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("user_packs")
    .select("quantity, total_opened")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? { quantity: 0, total_opened: 0 });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { teamId } = await req.json();

  // Check pack count
  const { data: packs } = await supabase
    .from("user_packs")
    .select("quantity, total_opened")
    .eq("user_id", user.id)
    .single();

  if (!packs || packs.quantity <= 0) {
    return NextResponse.json({ error: "No packs available" }, { status: 400 });
  }

  // Get user's already collected cards
  const { data: collected } = await supabase
    .from("user_collections")
    .select("card_id")
    .eq("user_id", user.id)
    .eq("is_duplicate", false);

  const collectedIds = new Set((collected ?? []).map((c: { card_id: string }) => c.card_id));

  // Get players for the selected team
  let query = supabase.from("players").select("id, name, num, pos, team_id, face_url");

  if (teamId) {
    query = query.eq("team_id", teamId);
  }

  const { data: allCards } = await query;

  if (!allCards || allCards.length < 6) {
    return NextResponse.json({ error: "Not enough cards available" }, { status: 400 });
  }

  // Randomly select 4 players + 1 stadium + 1 venue OR 6 random players
  const shuffled = [...allCards].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 6);

  // Decrement pack count
  const { error: updateError } = await supabase
    .from("user_packs")
    .update({
      quantity: packs.quantity - 1,
      total_opened: packs.total_opened + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Return the cards with isNew info
  const result = selected.map((c) => ({
    id: c.id,
    name: c.name,
    num: c.num,
    pos: c.pos,
    teamId: c.team_id,
    faceUrl: c.face_url,
    isNew: !collectedIds.has(c.id),
  }));

  return NextResponse.json({ cards: result, packsLeft: packs.quantity - 1 });
}
