"use client";

import { useCallback, useEffect, useState } from "react";

export type PushNotificationState = {
  supported: boolean;
  permission: NotificationPermission | "unsupported";
  requestPermission: () => Promise<NotificationPermission | "unsupported">;
};

export function usePushNotifications(): PushNotificationState {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("unsupported");

  useEffect(() => {
    const hasSupport = "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
    setSupported(hasSupport);
    setPermission(hasSupport ? Notification.permission : "unsupported");
  }, []);

  const requestPermission = useCallback(async () => {
    if (!supported || !("Notification" in window)) {
      return "unsupported" as const;
    }

    const nextPermission = await Notification.requestPermission();
    setPermission(nextPermission);
    return nextPermission;
  }, [supported]);

  return {
    supported,
    permission,
    requestPermission
  };
}
