import { apiClient } from "./client";

export interface Notification {
  id: number;
  user_id: number;

  title: string;
  message: string;

  notification_type: string;

  entity_type: string | null;
  entity_id: number | null;

  is_read: boolean;

  created_at: string;
}

/**
 * Get notifications belonging to
 * the authenticated user.
 */
export async function getMyNotifications(): Promise<
  Notification[]
> {
  const response =
    await apiClient.get<Notification[]>(
      "/notifications/"
    );

  return response.data;
}

/**
 * Get one notification.
 */
export async function getNotificationById(
  notificationId: number
): Promise<Notification> {
  const response =
    await apiClient.get<Notification>(
      `/notifications/${notificationId}`
    );

  return response.data;
}

/**
 * Mark one notification as read.
 */
export async function markNotificationAsRead(
  notificationId: number
): Promise<Notification> {
  const response =
    await apiClient.put<Notification>(
      `/notifications/${notificationId}/read`
    );

  return response.data;
}

/**
 * Mark all notifications as read.
 */
export async function markAllNotificationsAsRead(): Promise<{
  updated_count: number;
}> {
  const response =
    await apiClient.put<{
      updated_count: number;
    }>("/notifications/read-all");

  return response.data;
}

/**
 * Delete one notification.
 */
export async function deleteNotification(
  notificationId: number
): Promise<void> {
  await apiClient.delete(
    `/notifications/${notificationId}`
  );
}