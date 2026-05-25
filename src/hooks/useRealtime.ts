"use client";

import { useEffect } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import type { RealtimeChannel } from "@supabase/supabase-js";

type TableName = "user_packs" | "trade_offers" | "trade_listings" | "user_collections" | "notifications";

interface RealtimeOptions {
  table: TableName;
  filter?: string;
  onInsert?: (payload: Record<string, unknown>) => void;
  onUpdate?: (payload: Record<string, unknown>) => void;
  onDelete?: (payload: Record<string, unknown>) => void;
}

export function useRealtime({ table, filter, onInsert, onUpdate, onDelete }: RealtimeOptions) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const sb = getSupabase();
    let channel: RealtimeChannel;

    if (table === "user_packs") {
      channel = sb
        .channel(`user_packs:${user.id}`)
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table, filter: `user_id=eq.${user.id}` },
          (payload) => onUpdate?.(payload.new as Record<string, unknown>)
        )
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table, filter: `user_id=eq.${user.id}` },
          (payload) => onInsert?.(payload.new as Record<string, unknown>)
        )
        .subscribe();
    } else if (table === "trade_offers") {
      const orFilter = `from_user_id=eq.${user.id},to_user_id=eq.${user.id}`;
      channel = sb
        .channel(`trade_offers:${user.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table, filter: orFilter },
          (payload) => {
            if (payload.eventType === "INSERT") onInsert?.(payload.new as Record<string, unknown>);
            else if (payload.eventType === "UPDATE") onUpdate?.(payload.new as Record<string, unknown>);
            else if (payload.eventType === "DELETE") onDelete?.(payload.old as Record<string, unknown>);
          }
        )
        .subscribe();
    } else if (table === "trade_listings") {
      channel = sb
        .channel(`trade_listings:${user.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table },
          (payload) => {
            if (payload.eventType === "INSERT" && (payload.new as Record<string, unknown>).user_id !== user.id) onInsert?.(payload.new as Record<string, unknown>);
            else if (payload.eventType === "UPDATE") onUpdate?.(payload.new as Record<string, unknown>);
            else if (payload.eventType === "DELETE") onDelete?.(payload.old as Record<string, unknown>);
          }
        )
        .subscribe();
    } else {
      // Generic subscription
      const eventFilter = filter || `user_id=eq.${user.id}`;
      channel = sb
        .channel(`${table}:${user.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table, filter: eventFilter },
          (payload) => {
            if (payload.eventType === "INSERT") onInsert?.(payload.new as Record<string, unknown>);
            else if (payload.eventType === "UPDATE") onUpdate?.(payload.new as Record<string, unknown>);
            else if (payload.eventType === "DELETE") onDelete?.(payload.old as Record<string, unknown>);
          }
        )
        .subscribe();
    }

    return () => {
      sb.removeChannel(channel);
    };
  }, [user, table, filter, onInsert, onUpdate, onDelete]);
}
