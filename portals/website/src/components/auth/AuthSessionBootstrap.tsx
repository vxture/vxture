"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "@/lib/i18n/navigation";
import { useAuthStore } from "@/stores/auth.store";

const SESSION_RESTORE_THROTTLE_MS = 1500;
const SESSION_SYNC_INTERVAL_MS = 2000;

export function AuthSessionBootstrap() {
  const pathname = usePathname();
  const lastRestoreAtRef = useRef(0);
  const bootstrappedRef = useRef(false);
  const inFlightRef = useRef(false);

  useEffect(() => {
    const silent = bootstrappedRef.current;
    bootstrappedRef.current = true;
    lastRestoreAtRef.current = Date.now();
    void useAuthStore.getState().restoreSession({ silent });
  }, [pathname]);

  useEffect(() => {
    const restoreIfStale = () => {
      const now = Date.now();
      if (
        inFlightRef.current ||
        now - lastRestoreAtRef.current < SESSION_RESTORE_THROTTLE_MS
      ) {
        return;
      }

      lastRestoreAtRef.current = now;
      inFlightRef.current = true;
      void useAuthStore
        .getState()
        .restoreSession({ silent: true })
        .finally(() => {
          inFlightRef.current = false;
        });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        restoreIfStale();
      }
    };

    const intervalId = window.setInterval(
      restoreIfStale,
      SESSION_SYNC_INTERVAL_MS,
    );
    window.addEventListener("focus", restoreIfStale);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", restoreIfStale);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
