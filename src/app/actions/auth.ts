"use server";

import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase-server";

export type AuthResult = { ok: false; error: "invalid" | "unavailable" };

export async function signIn(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await getSupabaseServer();
  if (!supabase) return { ok: false, error: "unavailable" };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: "invalid" };

  redirect("/admin/posts");
}

export async function signOut(): Promise<void> {
  const supabase = await getSupabaseServer();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin/login");
}
