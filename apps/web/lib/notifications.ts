import {
  countUnreadNotifications,
  fetchNotificationsForClient,
  markNotificationReadForClient,
  type AppNotification
} from "@cnl/shared";
import { cached, invalidateCache } from "./cache";
import { supabase } from "./supabase";

export { countUnreadNotifications };

export function fetchNotifications(limit = 8): Promise<AppNotification[]> {
  return cached(`notifications:${limit}`, () => fetchNotificationsForClient(supabase, limit), 8_000);
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await markNotificationReadForClient(supabase, notificationId);
  invalidateCache("notifications:");
}
