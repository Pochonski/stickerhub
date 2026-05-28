import { getSupabase } from "@/infrastructure/supabase/client";
import type { NotificationRepository, NotificationDTO, CreateNotificationDTO } from "@/core/application/ports";

export class SupabaseNotificationRepository implements NotificationRepository {
  async getNotifications(userId: string): Promise<NotificationDTO[]> {
    const sb = getSupabase();
    const { data } = await sb
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    return (data as NotificationDTO[]) ?? [];
  }

  async markAsRead(notificationId: string): Promise<void> {
    const sb = getSupabase();
    await sb
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);
  }

  async create(params: CreateNotificationDTO): Promise<void> {
    const sb = getSupabase();
    await sb.from("notifications").insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      reference_id: params.referenceId ?? null,
    });
  }
}
