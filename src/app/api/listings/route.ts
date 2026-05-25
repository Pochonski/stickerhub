// GET /api/listings — Browse marketplace listings
// POST /api/listings — Publish a duplicate card for trade

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const search = url.searchParams.get("search") || "";
  const teamId = url.searchParams.get("teamId") || "";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);

  let query = supabase
    .from("trade_listings")
    .select("id, card_id, card_name, team_name, looking_for, created_at, profiles!inner(display_name, avatar_url, reputation, badge_tier)")
    .eq("is_active", true)
    .neq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (search) {
    query = query.or(`card_name.ilike.%${search}%,team_name.ilike.%${search}%`);
  }
  if (teamId) {
    query = query.eq("cards.team_id", teamId);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { cardId, cardName, teamName, lookingFor } = await req.json();

  if (!cardId || !cardName) {
    return NextResponse.json({ error: "cardId and cardName are required" }, { status: 400 });
  }

  // Verify user owns this card as duplicate
  const { data: owned } = await supabase
    .from("user_collections")
    .select("id")
    .eq("user_id", user.id)
    .eq("card_id", cardId)
    .eq("is_duplicate", true)
    .single();

  if (!owned) {
    return NextResponse.json({ error: "You don't own this card as a duplicate" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("trade_listings")
    .insert({
      user_id: user.id,
      card_id: cardId,
      card_name: cardName,
      team_name: teamName,
      looking_for: lookingFor,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
