// GET /api/profile — Get user profile
// PUT /api/profile — Update user profile

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get collection stats
  const { count: collected } = await supabase
    .from("user_collections")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_duplicate", false);

  const { count: duplicates } = await supabase
    .from("user_collections")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_duplicate", true);

  // Get trade stats
  const { count: completedTrades } = await supabase
    .from("trade_offers")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed")
    .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`);

  const { count: pendingTrades } = await supabase
    .from("trade_offers")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")
    .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`);

  return NextResponse.json({
    ...profile,
    stats: {
      collected: collected ?? 0,
      duplicates: duplicates ?? 0,
      completedTrades: completedTrades ?? 0,
      pendingTrades: pendingTrades ?? 0,
    },
  });
}

export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { displayName, country } = await req.json();

  const { data, error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      country: country,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
