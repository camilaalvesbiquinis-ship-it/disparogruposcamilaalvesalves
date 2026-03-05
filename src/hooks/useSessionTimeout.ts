/**
 * Session timeout hook — logs out user after 30 minutes of inactivity.
 * Also syncs logout across all tabs via localStorage event.
 */
import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const LOGOUT_EVENT_KEY = "app_logout_event";

export function useSessionTimeout() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      await supabase.auth.signOut();
      localStorage.setItem(LOGOUT_EVENT_KEY, Date.now().toString());
    }, TIMEOUT_MS);
  }, []);

  useEffect(() => {
    // Activity events that reset the timer
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    // Cross-tab logout sync
    const handleStorage = (e: StorageEvent) => {
      if (e.key === LOGOUT_EVENT_KEY) {
        supabase.auth.signOut();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      window.removeEventListener("storage", handleStorage);
    };
  }, [resetTimer]);
}
