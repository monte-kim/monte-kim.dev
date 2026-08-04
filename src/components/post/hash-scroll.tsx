"use client";

import { useEffect } from "react";

/**
 * Streamed pages (loading.tsx) break native hash scrolling — the browser
 * tries before the body exists. Re-run the scroll once content is mounted.
 */
export function HashScroll() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    // the router's own post-navigation scroll can land after ours —
    // re-assert a few times until layout settles
    const timers = [0, 120, 300, 600, 1000].map((ms) =>
      setTimeout(() => document.getElementById(id)?.scrollIntoView(), ms)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return null;
}
