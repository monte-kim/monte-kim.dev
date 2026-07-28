import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — bypasses RLS. Import ONLY from server
 * actions / route handlers; the key must never reach the client bundle.
 * Returns null when env vars are not configured so writes silently no-op
 * during local development without Supabase.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (typeof window !== "undefined") {
    throw new Error("supabase-admin must not be imported in client code");
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
