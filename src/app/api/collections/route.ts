// GET /api/collections — Get user's collection
// POST /api/collections — Add a card to collection

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("user_collections")
    .select("card_id, is_duplicate, collected_at, source")
    .eq("user_id", user.id)
    .order("collected_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { cardId, isDuplicate, source } = await req.json();

  if (!cardId) return NextResponse.json({ error: "cardId is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("user_collections")
    .insert({
      user_id: user.id,
      card_id: cardId,
      is_duplicate: isDuplicate ?? false,
      source: source ?? "pack",
    })
    .select()
    .single();

  if (error) {
    // Unique constraint — card already collected
    if (error.code === "23505") {
      return NextResponse.json({ error: "Card already in collection" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
