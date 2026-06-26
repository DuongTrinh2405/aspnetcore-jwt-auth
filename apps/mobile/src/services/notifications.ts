import {
  fetchNotificationsForClient,
  markNotificationReadForClient,
  type AppNotification
} from "@cnl/shared";
import { supabase } from "./supabase";

export function fetchNotifications(limit = 8): Promise<AppNotification[]> {
  return fetchNotificationsForClient(supabase, limit);
}

export function markNotificationRead(notificationId: string): Promise<void> {
  return markNotificationReadForClient(supabase, notificationId);
}
