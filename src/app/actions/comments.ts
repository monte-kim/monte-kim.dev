"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { isRateLimited } from "@/lib/rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type CommentResult =
  | { ok: true }
  | { ok: false; error: "invalid" | "rateLimited" | "unavailable" };

const MAX_NAME = 80;
const MAX_EMAIL = 200;
const MAX_BODY = 4000;

// 5 comments per IP per 10 minutes (see rate-limit.ts for caveats)
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;

export async function addComment(
  slug: string,
  parentId: string | null,
  formData: FormData
): Promise<CommentResult> {
  // honeypot — real users never fill this hidden field
  if (formData.get("website")) return { ok: true };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (
    !name ||
    !body ||
    name.length > MAX_NAME ||
    email.length > MAX_EMAIL ||
    body.length > MAX_BODY
  ) {
    return { ok: false, error: "invalid" };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: "unavailable" };

  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(`comment:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return { ok: false, error: "rateLimited" };
  }

  try {
    const { data: post } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (!post) return { ok: false, error: "invalid" };

    // replies are one level deep — a reply's parent must be a top-level comment
    if (parentId) {
      const { data: parent } = await supabase
        .from("comments")
        .select("id,parent_id,post_id")
        .eq("id", parentId)
        .maybeSingle();
      if (!parent || parent.post_id !== post.id || parent.parent_id) {
        return { ok: false, error: "invalid" };
      }
    }

    const { error } = await supabase.from("comments").insert({
      post_id: post.id,
      parent_id: parentId,
      author_name: name,
      author_email: email || null,
      body,
    });
    if (error) return { ok: false, error: "unavailable" };

    revalidatePath(`/writing/${slug}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "unavailable" };
  }
}
