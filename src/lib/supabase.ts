import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Anonymous Supabase client for public reads (RLS: published posts only).
 * Returns null when env vars are not configured so the app can fall back
 * to sample content during local development.
 */
export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
