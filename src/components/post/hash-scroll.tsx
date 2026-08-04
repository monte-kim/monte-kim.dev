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
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView();
    });
  }, []);

  return null;
}
