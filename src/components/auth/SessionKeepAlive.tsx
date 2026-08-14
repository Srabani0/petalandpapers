"use client";

import { useEffect } from "react";

// Access tokens live 15 minutes (see src/lib/auth/jwt.ts). Nothing else in
// the app ever calls /api/auth/refresh, so a signed-in user idling on a page
// longer than that gets a silent "Unauthorized" on their next action. This
// renews the access token well inside that window so a session stays alive
// for as long as the tab is open (bounded by the 7-day refresh token).
const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

export function SessionKeepAlive() {
  useEffect(() => {
    const refresh = () => {
      fetch("/api/auth/refresh", { method: "POST" }).catch(() => {});
    };
    const id = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return null;
}
