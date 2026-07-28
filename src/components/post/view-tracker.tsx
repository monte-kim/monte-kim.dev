"use client";

import { useEffect, useRef } from "react";
import { recordView } from "@/app/actions/views";

/** Fires the view-count server action once per page visit. */
export function ViewTracker({ slug }: { slug: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    void recordView(slug);
  }, [slug]);

  return null;
}
