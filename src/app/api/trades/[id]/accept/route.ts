// PUT /api/trades/[id]/accept — Accept a trade offer

import { NextRequest, NextResponse } from "next/server";
import { SupabaseTradeRepository } from "@/infrastructure/repositories/supabase";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const tradeRepo = new SupabaseTradeRepository();
    await tradeRepo.acceptTrade(id, user.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PUT /api/trades/accept]", err);
    let message = "Internal server error";
    if (err instanceof Error) message = err.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
