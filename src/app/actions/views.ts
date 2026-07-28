"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * Record one view for a post. Dedupe is one count per (visitor IP, post, day):
 * the IP is salted-hashed (never stored raw) and the atomic upsert lives in
 * the `record_post_view` Postgres function. No-op without Supabase env.
 */
export async function recordView(slug: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  try {
    const headerList = await headers();
    const ip =
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headerList.get("x-real-ip") ||
      "unknown";

    const salt = process.env.IP_HASH_SALT ?? "";
    const ipHash = createHash("sha256").update(`${salt}:${ip}`).digest("hex");

    await supabase.rpc("record_post_view", { p_slug: slug, p_ip_hash: ipHash });
  } catch {
    // view counting must never break the page
  }
}
