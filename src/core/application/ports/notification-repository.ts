export interface NotificationDTO {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  reference_id?: string;
  created_at: string;
}

export interface CreateNotificationDTO {
  userId: string;
  type: string;
  title: string;
  body: string;
  referenceId?: string;
}

export interface NotificationRepository {
  getNotifications(userId: string): Promise<NotificationDTO[]>;
  markAsRead(notificationId: string): Promise<void>;
  create(params: CreateNotificationDTO): Promise<void>;
}
