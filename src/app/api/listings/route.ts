// GET /api/listings — Browse marketplace listings
// POST /api/listings — Publish a duplicate card for trade

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const search = url.searchParams.get("search") || "";
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

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.slice(7);

  const { cardId, cardName, teamName, lookingFor } = await req.json();

  if (!cardId || !cardName) {
    return NextResponse.json({ error: "cardId and cardName are required" }, { status: 400 });
  }

  // Verify the JWT and get user identity via Supabase's REST API.
  // We don't use the admin client for JWT verification — instead we create
  // a one-shot client with the user's token as the auth header.
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

  // Verify user owns this card as duplicate
  const { data: owned } = await supabaseAdmin
    .from("user_collections")
    .select("id")
    .eq("user_id", user.id)
    .eq("card_id", cardId)
    .eq("is_duplicate", true)
    .single();

  if (!owned) {
    return NextResponse.json({ error: "You don't own this card as a duplicate" }, { status: 400 });
  }

  // Use admin client to atomically delete any existing listing + insert fresh one.
  await supabaseAdmin
    .from("trade_listings")
    .delete()
    .eq("user_id", user.id)
    .eq("card_id", cardId);

  const { data, error } = await supabaseAdmin
    .from("trade_listings")
    .insert({
      user_id: user.id,
      card_id: cardId,
      card_name: cardName,
      team_name: teamName || "",
      looking_for: lookingFor || null,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("[POST /api/listings]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

